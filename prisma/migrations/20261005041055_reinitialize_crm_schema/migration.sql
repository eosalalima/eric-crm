/*
  Warnings:

  - You are about to drop the `companies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contacts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `deal_contacts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `deal_stage_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `deals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `funnel_stages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `funnels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stage_automations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workspace_members` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_workspace_id_owner_user_id_fkey";

-- DropForeignKey
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_workspace_id_company_id_fkey";

-- DropForeignKey
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_workspace_id_owner_user_id_fkey";

-- DropForeignKey
ALTER TABLE "deal_contacts" DROP CONSTRAINT "deal_contacts_workspace_id_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "deal_contacts" DROP CONSTRAINT "deal_contacts_workspace_id_deal_id_fkey";

-- DropForeignKey
ALTER TABLE "deal_stage_history" DROP CONSTRAINT "deal_stage_history_workspace_id_changed_by_fkey";

-- DropForeignKey
ALTER TABLE "deal_stage_history" DROP CONSTRAINT "deal_stage_history_workspace_id_deal_id_fkey";

-- DropForeignKey
ALTER TABLE "deals" DROP CONSTRAINT "deals_workspace_id_company_id_fkey";

-- DropForeignKey
ALTER TABLE "deals" DROP CONSTRAINT "deals_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "deals" DROP CONSTRAINT "deals_workspace_id_funnel_id_stage_id_fkey";

-- DropForeignKey
ALTER TABLE "deals" DROP CONSTRAINT "deals_workspace_id_owner_user_id_fkey";

-- DropForeignKey
ALTER TABLE "deals" DROP CONSTRAINT "deals_workspace_id_primary_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "funnel_stages" DROP CONSTRAINT "funnel_stages_workspace_id_funnel_id_fkey";

-- DropForeignKey
ALTER TABLE "funnels" DROP CONSTRAINT "funnels_workspace_id_created_by_fkey";

-- DropForeignKey
ALTER TABLE "funnels" DROP CONSTRAINT "funnels_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_workspace_id_author_user_id_fkey";

-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_workspace_id_company_id_fkey";

-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_workspace_id_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_workspace_id_deal_id_fkey";

-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "stage_automations" DROP CONSTRAINT "stage_automations_workspace_id_created_by_fkey";

-- DropForeignKey
ALTER TABLE "stage_automations" DROP CONSTRAINT "stage_automations_workspace_id_funnel_id_stage_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_workspace_id_assignee_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_workspace_id_company_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_workspace_id_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_workspace_id_created_by_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_workspace_id_deal_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "workspace_members" DROP CONSTRAINT "workspace_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "workspace_members" DROP CONSTRAINT "workspace_members_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "workspaces" DROP CONSTRAINT "workspaces_created_by_fkey";

-- AlterTable
ALTER TABLE "workspaces" ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropTable
DROP TABLE "companies";

-- DropTable
DROP TABLE "contacts";

-- DropTable
DROP TABLE "deal_contacts";

-- DropTable
DROP TABLE "deal_stage_history";

-- DropTable
DROP TABLE "deals";

-- DropTable
DROP TABLE "funnel_stages";

-- DropTable
DROP TABLE "funnels";

-- DropTable
DROP TABLE "notes";

-- DropTable
DROP TABLE "stage_automations";

-- DropTable
DROP TABLE "tasks";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "workspace_members";
