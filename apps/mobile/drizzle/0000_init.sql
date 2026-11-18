CREATE TABLE `activity` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_date` text NOT NULL,
	`start_minute` integer,
	`duration_minutes` integer DEFAULT 0 NOT NULL,
	`title` text NOT NULL,
	`hue` text NOT NULL,
	`icon` text NOT NULL,
	`kind` text NOT NULL,
	`done_at` text,
	`notes` text DEFAULT '' NOT NULL,
	`priority` text DEFAULT 'none' NOT NULL,
	`repeat` text DEFAULT 'never' NOT NULL,
	`labels` text DEFAULT '[]' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`project_id` text,
	`goal_id` text,
	`series_id` text,
	`routine_id` text,
	`status` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	CONSTRAINT "activity_event_has_start" CHECK("activity"."kind" <> 'event' OR "activity"."start_minute" IS NOT NULL)
);
--> statement-breakpoint
CREATE INDEX `activity_date_idx` ON `activity` (`activity_date`);--> statement-breakpoint
CREATE TABLE `subtask` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`title` text NOT NULL,
	`done_at` text,
	`position` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `subtask_activity_idx` ON `subtask` (`activity_id`);--> statement-breakpoint
CREATE TABLE `sync_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`operation` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL
);
