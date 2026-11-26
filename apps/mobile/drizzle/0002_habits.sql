CREATE TABLE `habit` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`hue` text NOT NULL,
	`frequency` text NOT NULL,
	`target` integer,
	`created_date` text NOT NULL,
	`deleted_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `habit_check_in` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text NOT NULL,
	`check_in_date` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`habit_id`) REFERENCES `habit`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `habit_check_in_habit_idx` ON `habit_check_in` (`habit_id`,`check_in_date`);