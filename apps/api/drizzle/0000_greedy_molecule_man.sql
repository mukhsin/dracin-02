CREATE TABLE `dramas` (
	`id` text PRIMARY KEY NOT NULL,
	`book_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`poster_url` text,
	`genres` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'ongoing' NOT NULL,
	`total_episodes` integer DEFAULT 0 NOT NULL,
	`play_count` text,
	`featured` integer DEFAULT false NOT NULL,
	`featured_order` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dramas_book_id_unique` ON `dramas` (`book_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `dramas_slug_unique` ON `dramas` (`slug`);--> statement-breakpoint
CREATE INDEX `dramas_status_idx` ON `dramas` (`status`);--> statement-breakpoint
CREATE INDEX `dramas_featured_idx` ON `dramas` (`featured`,`featured_order`);