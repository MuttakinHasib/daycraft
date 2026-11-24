CREATE TABLE `activity_series` (
	`id` text PRIMARY KEY NOT NULL,
	`rrule` text NOT NULL,
	`start_date` text NOT NULL,
	`until_date` text,
	`start_minute` integer,
	`duration_minutes` integer DEFAULT 0 NOT NULL,
	`title` text NOT NULL,
	`hue` text NOT NULL,
	`icon` text NOT NULL,
	`kind` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`priority` text DEFAULT 'none' NOT NULL,
	`labels` text DEFAULT '[]' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`subtasks` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
ALTER TABLE `activity` ADD `detached_at` text;--> statement-breakpoint
CREATE INDEX `activity_series_date_idx` ON `activity` (`series_id`,`activity_date`);