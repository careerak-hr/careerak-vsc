# Requirements Document

## Introduction

تحسينات لوحة تحكم الأدمن هي ميزة شاملة تهدف إلى تحويل لوحة التحكم الحالية إلى مركز قيادة تفاعلي متقدم. توفر هذه الميزة رؤية كاملة للمنصة في الوقت الفعلي مع أدوات قوية للإدارة والتحليل واتخاذ القرارات المبنية على البيانات.

تشمل التحسينات: رسوم بيانية تفاعلية، إحصائيات فورية، تصدير البيانات، لوحة قابلة للتخصيص، سجل النشاطات، إشعارات الأدمن، تقارير متقدمة، وإدارة محسّنة للمستخدمين والمحتوى.

## Glossary

- **Admin_Dashboard**: لوحة التحكم الرئيسية للمسؤولين والمشرفين
- **Widget**: مكون واجهة مستقل قابل للإضافة والإزالة والتخصيص
- **Activity_Log**: سجل يحتوي على جميع الأحداث والنشاطات المهمة في المنصة
- **Real_Time_Statistics**: إحصائيات تُحدّث تلقائياً دون الحاجة لإعادة تحميل الصفحة
- **Data_Export**: عملية تحويل البيانات إلى ملفات قابلة للتحميل (Excel, CSV, PDF)
- **Dashboard_Layout**: تخطيط لوحة التحكم المخصص لكل مسؤول
- **Admin_Notification**: إشعار موجه للمسؤولين عن أحداث مهمة
- **Flagged_Content**: محتوى تم الإبلاغ عنه من قبل المستخدمين
- **Growth_Rate**: معدل النمو المئوي مقارنة بفترة زمنية سابقة
- **Active_User**: مستخدم متصل بالمنصة حالياً
- **Chart**: رسم بياني تفاعلي لعرض البيانات
- **Filter**: أداة لتصفية البيانات حسب معايير محددة
- **Moderator**: مشرف له صلاحيات محدودة مقارنة بالمسؤول

## Requirements

### Requirement 1: Interactive Charts

**User Story:** As an admin, I want to view interactive charts showing platform metrics, so that I can understand trends and make data-driven decisions.

#### Acceptance Criteria

1. WHEN the Admin_Dashboard loads, THE System SHALL display a chart showing new users over time with daily, weekly, and monthly views
2. WHEN the Admin_Dashboard loads, THE System SHALL display a chart showing job postings and applications over time
3. WHEN the Admin_Dashboard loads, THE System SHALL display a chart showing courses and enrollments over time
4. WHEN the Admin_Dashboard loads, THE System SHALL display a pie chart showing user distribution by type (job seeker, company, freelancer)
5. WHEN the Admin_Dashboard loads, THE System SHALL display a chart showing reviews and ratings trends
6. WHEN an admin hovers over a data point on any Chart, THE System SHALL display detailed information for that point
7. WHEN an admin clicks on a Chart legend item, THE System SHALL toggle the visibility of that data series
8. WHEN an admin selects a time range filter, THE System SHALL update all Charts to reflect the selected period
9. WHERE revenue tracking is enabled, THE System SHALL display a revenue chart with income trends

### Requirement 2: Real-Time Statistics

**User Story:** As an admin, I want to see real-time statistics about platform activity, so that I can monitor current status and respond quickly to issues.

#### Acceptance Criteria

1. WHEN the Admin_Dashboard loads, THE System SHALL display the count of Active_Users
2. WHEN the Admin_Dashboard loads, THE System SHALL display the count of jobs posted today
3. WHEN the Admin_Dashboard loads, THE System SHALL display the count of applications submitted today
4. WHEN the Admin_Dashboard loads, THE System SHALL display the count of course enrollments today
5. WHEN the Admin_Dashboard loads, THE System SHALL display the count of new reviews today
6. WHEN the Admin_Dashboard loads, THE System SHALL display the Growth_Rate compared to the previous week and month
7. WHEN 30 seconds elapse, THE System SHALL automatically refresh all Real_Time_Statistics
8. WHEN a statistic value increases, THE System SHALL highlight the change with a visual indicator
9. WHEN a statistic value decreases, THE System SHALL highlight the change with a different visual indicator

### Requirement 3: Data Export

**User Story:** As an admin, I want to export platform data in various formats, so that I can analyze data offline or share reports with stakeholders.

#### Acceptance Criteria

1. WHEN an admin clicks the export button for users, THE System SHALL generate a downloadable file in the selected format (Excel, CSV, or PDF)
2. WHEN an admin clicks the export button for jobs, THE System SHALL generate a downloadable file in the selected format
3. WHEN an admin clicks the export button for applications, THE System SHALL generate a downloadable file in the selected format
4. WHEN an admin clicks the export button for courses, THE System SHALL generate a downloadable file in the selected format
5. WHEN an admin applies filters before exporting, THE System SHALL include only the filtered data in the export
6. WHEN an admin exports data, THE System SHALL include column headers and proper formatting
7. WHEN an admin exports to PDF, THE System SHALL include the platform logo and export timestamp
8. WHEN an admin exports to Excel, THE System SHALL create separate sheets for different data categories
9. WHERE activity log export is requested, THE System SHALL include all log fields (timestamp, actor, action, target, details, IP address)

### Requirement 4: Customizable Dashboard

**User Story:** As an admin, I want to customize my dashboard layout, so that I can focus on the metrics and tools most relevant to my role.

#### Acceptance Criteria

1. WHEN an admin enters edit mode, THE System SHALL allow dragging and dropping Widgets to rearrange them
2. WHEN an admin drags a Widget, THE System SHALL show a visual preview of the new position
3. WHEN an admin drops a Widget, THE System SHALL save the new Dashboard_Layout automatically
4. WHEN an admin clicks add widget, THE System SHALL display a list of available Widgets
5. WHEN an admin selects a Widget to add, THE System SHALL insert it into the Dashboard_Layout
6. WHEN an admin clicks remove on a Widget, THE System SHALL remove it from the Dashboard_Layout
7. WHEN an admin resizes a Widget, THE System SHALL adjust the layout and save the new size
8. WHEN an admin logs in, THE System SHALL load their saved Dashboard_Layout
9. WHEN an admin clicks reset layout, THE System SHALL restore the default Dashboard_Layout
10. THE System SHALL support at least 8 different Widget types (quick stats, charts, recent users, recent jobs, recent applications, activity log, flagged reviews, notifications)

### Requirement 5: Activity Log

**User Story:** As an admin, I want to view a comprehensive log of all platform activities, so that I can audit actions and investigate issues.

#### Acceptance Criteria

1. WHEN a user registers, THE System SHALL create an Activity_Log entry with type "user_registered"
2. WHEN a job is posted, THE System SHALL create an Activity_Log entry with type "job_posted"
3. WHEN an application is submitted, THE System SHALL create an Activity_Log entry with type "application_submitted"
4. WHEN an application status changes, THE System SHALL create an Activity_Log entry with type "application_status_changed"
5. WHEN a course is published, THE System SHALL create an Activity_Log entry with type "course_published"
6. WHEN a user enrolls in a course, THE System SHALL create an Activity_Log entry with type "course_enrolled"
7. WHEN a review is posted, THE System SHALL create an Activity_Log entry with type "review_posted"
8. WHEN content is reported, THE System SHALL create an Activity_Log entry with type "content_reported"
9. WHEN an admin modifies user data, THE System SHALL create an Activity_Log entry with type "user_modified"
10. WHEN content is deleted, THE System SHALL create an Activity_Log entry with type "content_deleted"
11. WHEN an admin views the Activity_Log, THE System SHALL display entries with timestamp, actor, action type, target, details, and IP address
12. WHEN an admin applies a filter to Activity_Log, THE System SHALL show only entries matching the filter criteria
13. WHEN an admin searches the Activity_Log, THE System SHALL return entries containing the search term
14. WHEN the Activity_Log has more than 50 entries, THE System SHALL paginate the results

### Requirement 6: Admin Notifications

**User Story:** As an admin, I want to receive notifications about important platform events, so that I can respond promptly to issues requiring attention.

#### Acceptance Criteria

1. WHEN a new user registers, THE System SHALL create an Admin_Notification
2. WHEN a job is posted, THE System SHALL create an Admin_Notification with priority "medium"
3. WHEN a course is published, THE System SHALL create an Admin_Notification with priority "medium"
4. WHEN a review is flagged, THE System SHALL create an Admin_Notification with priority "high"
5. WHEN content is reported, THE System SHALL create an Admin_Notification with priority "high"
6. WHEN suspicious activity is detected, THE System SHALL create an Admin_Notification with priority "urgent"
7. WHEN a system error occurs, THE System SHALL create an Admin_Notification with priority "urgent"
8. WHEN an admin has unread Admin_Notifications, THE System SHALL display a badge with the count on the notification icon
9. WHEN an admin clicks the notification icon, THE System SHALL display a dropdown list of recent Admin_Notifications
10. WHEN an admin clicks on an Admin_Notification, THE System SHALL mark it as read and navigate to the relevant page
11. WHEN an admin views the notifications page, THE System SHALL display all Admin_Notifications with filtering options
12. WHEN an admin disables a notification type in settings, THE System SHALL not create Admin_Notifications of that type

### Requirement 7: Advanced Reports

**User Story:** As an admin, I want to generate detailed reports about platform performance, so that I can analyze trends and present insights to stakeholders.

#### Acceptance Criteria

1. WHEN an admin requests a users report, THE System SHALL generate statistics including user count by type, growth rate, most active users, and inactive users
2. WHEN an admin requests a jobs report, THE System SHALL generate statistics including job count by field, application rate, most popular jobs, and most active companies
3. WHEN an admin requests a courses report, THE System SHALL generate statistics including course count by field, enrollment rate, most popular courses, and completion rate
4. WHEN an admin requests a reviews report, THE System SHALL generate statistics including review count, average ratings, and flagged reviews
5. WHERE revenue tracking is enabled, WHEN an admin requests a revenue report, THE System SHALL generate statistics including total revenue, revenue by source, and revenue trends
6. WHEN an admin selects a date range for a report, THE System SHALL include only data from that period
7. WHEN an admin generates a report, THE System SHALL display the results in a formatted view with charts and tables
8. WHEN an admin exports a report, THE System SHALL include all report data in the selected format

### Requirement 8: Enhanced User Management

**User Story:** As an admin, I want advanced tools to manage users, so that I can efficiently handle user accounts and resolve issues.

#### Acceptance Criteria

1. WHEN an admin searches for users, THE System SHALL support searching by name, email, username, and user type
2. WHEN an admin applies filters to the user list, THE System SHALL show only users matching the filter criteria (type, status, registration date)
3. WHEN an admin clicks on a user, THE System SHALL display complete user details including profile, activity history, and statistics
4. WHEN an admin edits user data, THE System SHALL validate the changes and update the user record
5. WHEN an admin disables a user account, THE System SHALL prevent that user from logging in
6. WHEN an admin enables a disabled account, THE System SHALL restore login access
7. WHEN an admin deletes a user account, THE System SHALL remove all user data and create an Activity_Log entry
8. WHEN an admin views user activity, THE System SHALL display all actions performed by that user
9. WHEN an admin sends a notification to a user, THE System SHALL deliver it through the notification system

### Requirement 9: Enhanced Content Management

**User Story:** As an admin, I want improved tools to manage platform content, so that I can maintain quality and handle reported content efficiently.

#### Acceptance Criteria

1. WHEN an admin views pending jobs, THE System SHALL display all jobs awaiting review
2. WHEN an admin views pending courses, THE System SHALL display all courses awaiting review
3. WHEN an admin views Flagged_Content, THE System SHALL display all reported reviews and content
4. WHEN an admin approves content, THE System SHALL publish it and notify the creator
5. WHEN an admin rejects content, THE System SHALL hide it and notify the creator with the reason
6. WHEN an admin deletes content, THE System SHALL remove it permanently and create an Activity_Log entry
7. WHEN an admin sends feedback to a content creator, THE System SHALL deliver it as a notification

### Requirement 10: UX Enhancements

**User Story:** As an admin, I want a modern and intuitive dashboard interface, so that I can work efficiently and comfortably.

#### Acceptance Criteria

1. WHEN the Admin_Dashboard loads, THE System SHALL display a clean and modern interface following the project design standards
2. WHEN an admin clicks the sidebar toggle, THE System SHALL collapse or expand the sidebar
3. WHEN an admin enables dark mode, THE System SHALL apply dark theme colors to all dashboard components
4. WHEN the Admin_Dashboard is viewed on a mobile device, THE System SHALL adapt the layout for smaller screens
5. WHEN data is loading, THE System SHALL display loading indicators
6. WHEN an error occurs, THE System SHALL display a user-friendly error message
7. WHEN an action succeeds, THE System SHALL display a toast notification confirming the action
8. WHEN an admin uses keyboard shortcuts, THE System SHALL execute the corresponding actions
9. THE System SHALL support RTL layout for Arabic language
10. THE System SHALL use the approved color palette (#304B60, #E3DAD1, #D48161) and fonts (Amiri, Cairo for Arabic)

### Requirement 11: Performance and Security

**User Story:** As an admin, I want the dashboard to load quickly and securely, so that I can work efficiently without delays or security concerns.

#### Acceptance Criteria

1. WHEN the Admin_Dashboard loads, THE System SHALL display initial content within 2 seconds
2. WHEN Real_Time_Statistics are updated, THE System SHALL use cached data to minimize database queries
3. WHEN large datasets are queried, THE System SHALL use database indexes to optimize performance
4. WHEN an admin exports data, THE System SHALL process the export asynchronously to avoid blocking
5. WHEN an unauthenticated user attempts to access admin endpoints, THE System SHALL return a 401 error
6. WHEN a non-admin user attempts to access admin endpoints, THE System SHALL return a 403 error
7. WHEN an admin performs an action, THE System SHALL log it in the Activity_Log for audit purposes
8. WHEN sensitive data is transmitted, THE System SHALL use HTTPS encryption
9. WHEN an admin session expires, THE System SHALL redirect to the login page

### Requirement 12: Data Integrity and Validation

**User Story:** As a system administrator, I want all dashboard data to be accurate and validated, so that I can trust the information for decision-making.

#### Acceptance Criteria

1. WHEN statistics are calculated, THE System SHALL use accurate aggregation queries
2. WHEN Growth_Rate is calculated, THE System SHALL compare equivalent time periods
3. WHEN a Chart is generated, THE System SHALL include all relevant data points without omissions
4. WHEN data is exported, THE System SHALL ensure the exported data matches the displayed data
5. WHEN filters are applied, THE System SHALL correctly filter all affected components
6. WHEN an admin modifies data, THE System SHALL validate all inputs before saving
7. WHEN concurrent admins modify the same data, THE System SHALL handle conflicts appropriately
8. WHEN Activity_Log entries are created, THE System SHALL include all required fields (timestamp, actor, action, target)
