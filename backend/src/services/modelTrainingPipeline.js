/**
 * Model Training Pipeline Service
 * 
 * خدمة شاملة لتدريب وتقييم نماذج التوصيات
 * - إعداد pipeline التدريب
 * - تقييم النماذج
 * - اختيار أفضل نموذج
 * - حفظ النماذج المدربة
 * 
 * @module services/modelTrainingPipeline
 */

const User = require('../models/User');
const JobPosting = require('../models/JobPosting');
const UserInteraction = require('../models/UserInteraction');
const MLModel = require('../models/MLModel');
const ContentBasedFiltering = require('./contentBasedFiltering');
const CollaborativeFiltering = require('./collaborativeFiltering');
const HybridRecommendation = require('./hybridRecommendation');

class ModelTrainingPipeline {
  constructor() {
    this.contentBasedModel = new ContentBasedFiltering();
    this.collaborativeModel = new CollaborativeFiltering();
    this.hybridModel = new HybridRecommendation();
    
    // معايير التقييم
    this.evaluationMetrics = {
      precision: 0,
      recall: 0,
      f1Score: 0,
      accuracy: 0,
      ndcg: 0,
      mrr: 0
    };
  }

  /**
   * تشغيل pipeline التدريب الكامل
   */
  async runFullPipeline(options = {}) {
    const {
      modelTypes = ['content_based', 'collaborative', 'hybrid'],
      testSize = 0.2,
      minInteractions = 10,
      saveModels = true
    } = options;

    console.log('🚀 بدء Model Training Pipeline...');
    
    try {
      // 1. جمع البيانات
      console.log('📊 جمع بيانات التدريب...');
      const trainingData = await this.collectTrainingData(minInteractions);
      
      if (!trainingData || trainingData.length === 0) {
        throw new Error('لا توجد بيانات كافية للتدريب');
      }

      console.log(`✅ تم جمع ${trainingData.length} عينة تدريب`);

      // 2. تقسيم البيانات
      console.log('🔀 تقسيم البيانات إلى تدريب واختبار...');
      const { trainSet, testSet } = this.splitData(trainingData, testSize);
      
      console.log(`📈 بيانات التدريب: ${trainSet.length} عينة`);
      console.log(`📉 بيانات الاختبار: ${testSet.length} عينة`);

      // 3. تدريب النماذج
      const trainedModels = [];
      
      for (const modelType of modelTypes) {
        console.log(`\n🎯 تدريب نموذج: ${modelType}...`);
        
        const modelResult = await this.trainModel(
          modelType,
          trainSet,
          testSet
        );
        
        trainedModels.push(modelResult);
        
        console.log(`✅ ${modelType} - Accuracy: ${(modelResult.metrics.accuracy * 100).toFixed(2)}%`);
      }

      // 4. اختيار أفضل نموذج
      console.log('\n🏆 اختيار أفضل نموذج...');
      const bestModel = this.selectBestModel(trainedModels);
      
      console.log(`✨ أفضل نموذج: ${bestModel.modelType}`);
      console.log(`📊 F1-Score: ${(bestModel.metrics.f1Score * 100).toFixed(2)}%`);

      // 5. حفظ النماذج
      if (saveModels) {
        console.log('\n💾 حفظ النماذج في قاعدة البيانات...');
        await this.saveModels(trainedModels, bestModel);
        console.log('✅ تم حفظ النماذج بنجاح');
      }

      // 6. توليد التقرير
      const report = this.generateTrainingReport(trainedModels, bestModel);

      console.log('\n✅ اكتمل Model Training Pipeline بنجاح!');
      
      return {
        success: true,
        trainedModels,
        bestModel,
        report,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ خطأ في Model Training Pipeline:', error);
      throw error;
    }
  }

  /**
   * جمع بيانات التدريب
   */
  async collectTrainingData(minInteractions = 10) {
    try {
      // جلب المستخدمين الذين لديهم تفاعلات كافية
      const users = await User.find({
        role: 'jobseeker',
        'profile.skills': { $exists: true, $ne: [] }
      }).select('profile preferences');

      const trainingData = [];

      for (const user of users) {
        // جلب تفاعلات المستخدم
        const interactions = await UserInteraction.find({
          userId: user._id,
          itemType: 'job'
        }).sort({ timestamp: -1 });

        if (interactions.length < minInteractions) {
          continue;
        }

        // جلب الوظائف التي تفاعل معها
        const jobIds = interactions.map(i => i.itemId);
        const jobs = await JobPosting.find({
          _id: { $in: jobIds },
          status: 'active'
        });

        // إنشاء عينات تدريب
        for (const interaction of interactions) {
          const job = jobs.find(j => j._id.toString() === interaction.itemId.toString());
          
          if (!job) continue;

          // تحديد التصنيف (positive/negative)
          const label = this.getInteractionLabel(interaction.action);

          trainingData.push({
            userId: user._id,
            jobId: job._id,
            userProfile: user.profile,
            jobDetails: {
              title: job.title,
              description: job.description,
              requirements: job.requirements,
              location: job.location,
              salary: job.salary,
              workType: job.workType
            },
            interaction: interaction.action,
            label,
            timestamp: interaction.timestamp
          });
        }
      }

      return trainingData;

    } catch (error) {
      console.error('خطأ في جمع بيانات التدريب:', error);
      throw error;
    }
  }

  /**
   * تحديد تصنيف التفاعل
   */
  getInteractionLabel(action) {
    const labelMap = {
      'apply': 1.0,    // إيجابي جداً
      'like': 0.8,     // إيجابي
      'save': 0.7,     // إيجابي متوسط
      'view': 0.3,     // محايد
      'ignore': 0.0    // سلبي
    };

    return labelMap[action] || 0.3;
  }

  /**
   * تقسيم البيانات إلى تدريب واختبار
   */
  splitData(data, testSize = 0.2) {
    // خلط البيانات عشوائياً
    const shuffled = data.sort(() => Math.random() - 0.5);
    
    const splitIndex = Math.floor(data.length * (1 - testSize));
    
    return {
      trainSet: shuffled.slice(0, splitIndex),
      testSet: shuffled.slice(splitIndex)
    };
  }

  /**
   * تدريب نموذج محدد
   */
  async trainModel(modelType, trainSet, testSet) {
    const startTime = Date.now();

    try {
      let model;
      let predictions = [];

      // اختيار النموذج
      switch (modelType) {
        case 'content_based':
          model = this.contentBasedModel;
          predictions = await this.trainContentBased(trainSet, testSet);
          break;

        case 'collaborative':
          model = this.collaborativeModel;
          predictions = await this.trainCollaborative(trainSet, testSet);
          break;

        case 'hybrid':
          model = this.hybridModel;
          predictions = await this.trainHybrid(trainSet, testSet);
          break;

        default:
          throw new Error(`نوع نموذج غير معروف: ${modelType}`);
      }

      // تقييم النموذج
      const metrics = this.evaluateModel(testSet, predictions);

      const trainingTime = (Date.now() - startTime) / 1000;

      return {
        modelType,
        model,
        metrics,
        trainingTime,
        trainSize: trainSet.length,
        testSize: testSet.length,
        version: this.generateModelVersion(),
        trainedAt: new Date()
      };

    } catch (error) {
      console.error(`خطأ في تدريب نموذج ${modelType}:`, error);
      throw error;
    }
  }

  /**
   * تدريب Content-Based Model
   */
  async trainContentBased(trainSet, testSet) {
    const predictions = [];

    for (const sample of testSet) {
      try {
        // حساب التطابق
        const match = await this.contentBasedModel.calculateMatchScore(
          { profile: sample.userProfile },
          sample.jobDetails
        );

        predictions.push({
          userId: sample.userId,
          jobId: sample.jobId,
          predictedScore: match.score / 100, // تحويل إلى 0-1
          actualLabel: sample.label
        });

      } catch (error) {
        console.error('خطأ في التنبؤ:', error);
      }
    }

    return predictions;
  }

  /**
   * تدريب Collaborative Model
   */
  async trainCollaborative(trainSet, testSet) {
    const predictions = [];

    // بناء user-item matrix من بيانات التدريب
    await this.collaborativeModel.buildUserItemMatrix();

    for (const sample of testSet) {
      try {
        // الحصول على توصيات
        const recommendations = await this.collaborativeModel.getRecommendations(
          sample.userId,
          10
        );

        // البحث عن الوظيفة في التوصيات
        const recommendation = recommendations.find(
          r => r.jobId.toString() === sample.jobId.toString()
        );

        const predictedScore = recommendation ? recommendation.score / 100 : 0;

        predictions.push({
          userId: sample.userId,
          jobId: sample.jobId,
          predictedScore,
          actualLabel: sample.label
        });

      } catch (error) {
        console.error('خطأ في التنبؤ:', error);
      }
    }

    return predictions;
  }

  /**
   * تدريب Hybrid Model
   */
  async trainHybrid(trainSet, testSet) {
    const predictions = [];

    for (const sample of testSet) {
      try {
        // الحصول على توصيات هجينة
        const recommendations = await this.hybridModel.getHybridRecommendations(
          sample.userId,
          10
        );

        // البحث عن الوظيفة
        const recommendation = recommendations.find(
          r => r.jobId.toString() === sample.jobId.toString()
        );

        const predictedScore = recommendation ? recommendation.score / 100 : 0;

        predictions.push({
          userId: sample.userId,
          jobId: sample.jobId,
          predictedScore,
          actualLabel: sample.label
        });

      } catch (error) {
        console.error('خطأ في التنبؤ:', error);
      }
    }

    return predictions;
  }

  /**
   * تقييم النموذج
   */
  evaluateModel(testSet, predictions) {
    if (!predictions || predictions.length === 0) {
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        ndcg: 0,
        mrr: 0
      };
    }

    // حساب Accuracy
    const accuracy = this.calculateAccuracy(predictions);

    // حساب Precision & Recall
    const { precision, recall } = this.calculatePrecisionRecall(predictions);

    // حساب F1-Score
    const f1Score = precision + recall > 0
      ? (2 * precision * recall) / (precision + recall)
      : 0;

    // حساب NDCG
    const ndcg = this.calculateNDCG(predictions);

    // حساب MRR
    const mrr = this.calculateMRR(predictions);

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      ndcg,
      mrr,
      sampleSize: predictions.length
    };
  }

  /**
   * حساب Accuracy
   */
  calculateAccuracy(predictions, threshold = 0.5) {
    let correct = 0;

    for (const pred of predictions) {
      const predicted = pred.predictedScore >= threshold ? 1 : 0;
      const actual = pred.actualLabel >= threshold ? 1 : 0;

      if (predicted === actual) {
        correct++;
      }
    }

    return predictions.length > 0 ? correct / predictions.length : 0;
  }

  /**
   * حساب Precision & Recall
   */
  calculatePrecisionRecall(predictions, threshold = 0.5) {
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    for (const pred of predictions) {
      const predicted = pred.predictedScore >= threshold;
      const actual = pred.actualLabel >= threshold;

      if (predicted && actual) {
        truePositives++;
      } else if (predicted && !actual) {
        falsePositives++;
      } else if (!predicted && actual) {
        falseNegatives++;
      }
    }

    const precision = truePositives + falsePositives > 0
      ? truePositives / (truePositives + falsePositives)
      : 0;

    const recall = truePositives + falseNegatives > 0
      ? truePositives / (truePositives + falseNegatives)
      : 0;

    return { precision, recall };
  }

  /**
   * حساب NDCG (Normalized Discounted Cumulative Gain)
   */
  calculateNDCG(predictions, k = 10) {
    // ترتيب حسب التنبؤ
    const sorted = predictions
      .sort((a, b) => b.predictedScore - a.predictedScore)
      .slice(0, k);

    // حساب DCG
    let dcg = 0;
    for (let i = 0; i < sorted.length; i++) {
      const relevance = sorted[i].actualLabel;
      dcg += relevance / Math.log2(i + 2);
    }

    // حساب IDCG (ideal DCG)
    const idealSorted = predictions
      .sort((a, b) => b.actualLabel - a.actualLabel)
      .slice(0, k);

    let idcg = 0;
    for (let i = 0; i < idealSorted.length; i++) {
      const relevance = idealSorted[i].actualLabel;
      idcg += relevance / Math.log2(i + 2);
    }

    return idcg > 0 ? dcg / idcg : 0;
  }

  /**
   * حساب MRR (Mean Reciprocal Rank)
   */
  calculateMRR(predictions) {
    // ترتيب حسب التنبؤ
    const sorted = predictions.sort((a, b) => b.predictedScore - a.predictedScore);

    // إيجاد أول نتيجة ذات صلة
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].actualLabel >= 0.5) {
        return 1 / (i + 1);
      }
    }

    return 0;
  }

  /**
   * اختيار أفضل نموذج
   */
  selectBestModel(trainedModels) {
    if (!trainedModels || trainedModels.length === 0) {
      throw new Error('لا توجد نماذج مدربة');
    }

    // الترتيب حسب F1-Score (أهم مقياس)
    const sorted = trainedModels.sort((a, b) => {
      return b.metrics.f1Score - a.metrics.f1Score;
    });

    return sorted[0];
  }

  /**
   * حفظ النماذج في قاعدة البيانات
   */
  async saveModels(trainedModels, bestModel) {
    try {
      for (const model of trainedModels) {
        const mlModel = new MLModel({
          modelId: `${model.modelType}_${model.version}`,
          modelType: model.modelType,
          version: model.version,
          accuracy: model.metrics.accuracy,
          precision: model.metrics.precision,
          recall: model.metrics.recall,
          f1Score: model.metrics.f1Score,
          trainingDate: model.trainedAt,
          isActive: model.modelType === bestModel.modelType,
          hyperparameters: {
            trainSize: model.trainSize,
            testSize: model.testSize,
            trainingTime: model.trainingTime
          },
          features: this.getModelFeatures(model.modelType)
        });

        await mlModel.save();
      }

      // تعطيل النماذج القديمة
      await MLModel.updateMany(
        {
          modelType: bestModel.modelType,
          version: { $ne: bestModel.version }
        },
        { isActive: false }
      );

    } catch (error) {
      console.error('خطأ في حفظ النماذج:', error);
      throw error;
    }
  }

  /**
   * الحصول على features النموذج
   */
  getModelFeatures(modelType) {
    const featureMap = {
      content_based: [
        'skills',
        'experience',
        'education',
        'location',
        'salary',
        'workType'
      ],
      collaborative: [
        'userInteractions',
        'similarUsers',
        'itemPopularity'
      ],
      hybrid: [
        'skills',
        'experience',
        'education',
        'location',
        'salary',
        'workType',
        'userInteractions',
        'similarUsers'
      ]
    };

    return featureMap[modelType] || [];
  }

  /**
   * توليد رقم إصدار النموذج
   */
  generateModelVersion() {
    const date = new Date();
    return `v${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}.${date.getHours()}${date.getMinutes()}`;
  }

  /**
   * توليد تقرير التدريب
   */
  generateTrainingReport(trainedModels, bestModel) {
    const report = {
      summary: {
        totalModels: trainedModels.length,
        bestModel: bestModel.modelType,
        bestF1Score: bestModel.metrics.f1Score,
        timestamp: new Date()
      },
      models: trainedModels.map(m => ({
        type: m.modelType,
        version: m.version,
        metrics: m.metrics,
        trainingTime: m.trainingTime,
        trainSize: m.trainSize,
        testSize: m.testSize
      })),
      recommendations: this.generateRecommendations(trainedModels, bestModel)
    };

    return report;
  }

  /**
   * توليد توصيات للتحسين
   */
  generateRecommendations(trainedModels, bestModel) {
    const recommendations = [];

    // التحقق من دقة النماذج
    for (const model of trainedModels) {
      if (model.metrics.accuracy < 0.7) {
        recommendations.push({
          model: model.modelType,
          issue: 'دقة منخفضة',
          suggestion: 'جمع المزيد من بيانات التدريب أو تحسين feature engineering'
        });
      }

      if (model.metrics.precision < 0.6) {
        recommendations.push({
          model: model.modelType,
          issue: 'precision منخفض',
          suggestion: 'تحسين معايير التصفية لتقليل False Positives'
        });
      }

      if (model.metrics.recall < 0.6) {
        recommendations.push({
          model: model.modelType,
          issue: 'recall منخفض',
          suggestion: 'توسيع نطاق التوصيات لتقليل False Negatives'
        });
      }
    }

    // توصيات عامة
    if (bestModel.metrics.f1Score < 0.75) {
      recommendations.push({
        model: 'all',
        issue: 'أداء عام يحتاج تحسين',
        suggestion: 'النظر في A/B testing وتحسين hyperparameters'
      });
    }

    return recommendations;
  }
}

module.exports = ModelTrainingPipeline;
