-- Autolanka Database Initialization Script
-- This script sets up the initial database structure and data

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS autolanka_dev;

-- Use the database
\c autolanka_dev;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE media_status AS ENUM ('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE draft_status AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE platform AS ENUM ('INSTAGRAM', 'YOUTUBE', 'FACEBOOK', 'TWITTER', 'TIKTOK', 'LINKEDIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE schedule_status AS ENUM ('PENDING', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sentiment AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL', 'SPAM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE plan_type AS ENUM ('FREE', 'STARTER', 'PRO', 'ENTERPRISE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED', 'PAST_DUE', 'UNPAID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_media_org_id ON media(org_id);
CREATE INDEX IF NOT EXISTS idx_media_status ON media(status);
CREATE INDEX IF NOT EXISTS idx_draft_posts_org_id ON draft_posts(org_id);
CREATE INDEX IF NOT EXISTS idx_draft_posts_status ON draft_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_for ON scheduled_posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_social_accounts_org_id ON social_accounts(org_id);
CREATE INDEX IF NOT EXISTS idx_comments_org_id ON comments(org_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_is_public ON workflow_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_org_id ON workflow_executions(org_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_by ON community_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_org_id ON webhook_configs(org_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_webhook_id ON webhook_events(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_application_metrics_timestamp ON application_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_rule_id ON alerts(rule_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_analytics_org_id ON analytics(org_id);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_media_title_search ON media USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_media_description_search ON media USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_workflow_templates_title_search ON workflow_templates USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_workflow_templates_description_search ON workflow_templates USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_community_posts_title_search ON community_posts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_community_posts_content_search ON community_posts USING gin(to_tsvector('english', content));

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_media_org_status ON media(org_id, status);
CREATE INDEX IF NOT EXISTS idx_draft_posts_org_status ON draft_posts(org_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_org_status ON workflow_executions(org_id, status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_webhook_status ON webhook_events(webhook_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_rule_resolved ON alerts(rule_id, resolved);

-- Create partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_media_active ON media(org_id) WHERE status != 'FAILED';
CREATE INDEX IF NOT EXISTS idx_draft_posts_active ON draft_posts(org_id) WHERE status IN ('DRAFT', 'SCHEDULED');
CREATE INDEX IF NOT EXISTS idx_workflow_executions_active ON workflow_executions(org_id) WHERE status IN ('PENDING', 'RUNNING');
CREATE INDEX IF NOT EXISTS idx_webhook_configs_enabled ON webhook_configs(org_id) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON alerts(rule_id) WHERE resolved = false;

-- Create indexes for time-based queries
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_draft_posts_created_at ON draft_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_created_at ON workflow_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create indexes for foreign key relationships
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(org_id);
CREATE INDEX IF NOT EXISTS idx_brands_org_id ON brands(org_id);
CREATE INDEX IF NOT EXISTS idx_microclips_media_id ON microclips(media_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_draft_post_id ON scheduled_posts(draft_post_id);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_competitor_id ON competitor_posts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_workflow_reviews_template_id ON workflow_reviews(template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_reviews_user_id ON workflow_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_downloads_template_id ON workflow_downloads(template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_downloads_user_id ON workflow_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_versions_template_id ON workflow_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_execution_id ON workflow_steps(execution_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created_by ON community_comments(created_by);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event_id ON webhook_deliveries(event_id);

-- Create indexes for array columns
CREATE INDEX IF NOT EXISTS idx_media_tags ON media USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_media_hashtags ON media USING gin(hashtags);
CREATE INDEX IF NOT EXISTS idx_brands_content_types ON brands USING gin(content_types);
CREATE INDEX IF NOT EXISTS idx_brands_goals ON brands USING gin(goals);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_tags ON workflow_templates USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON community_posts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_user_profiles_skills ON user_profiles USING gin(skills);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_events ON webhook_configs USING gin(events);
CREATE INDEX IF NOT EXISTS idx_alert_rules_actions ON alert_rules USING gin(actions);

-- Create indexes for JSON columns
CREATE INDEX IF NOT EXISTS idx_organizations_settings ON organizations USING gin(settings);
CREATE INDEX IF NOT EXISTS idx_brands_settings ON brands USING gin(settings);
CREATE INDEX IF NOT EXISTS idx_media_metadata ON media USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_social_accounts_settings ON social_accounts USING gin(settings);
CREATE INDEX IF NOT EXISTS idx_competitors_settings ON competitors USING gin(settings);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_engagement ON competitor_posts USING gin(engagement);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_analysis ON competitor_posts USING gin(analysis);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_content ON workflow_templates USING gin(content);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_metadata ON workflow_templates USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_content ON workflow_executions USING gin(content);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_metadata ON workflow_executions USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_input ON workflow_steps USING gin(input);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_output ON workflow_steps USING gin(output);
CREATE INDEX IF NOT EXISTS idx_community_posts_metadata ON community_posts USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_user_profiles_portfolio ON user_profiles USING gin(portfolio);
CREATE INDEX IF NOT EXISTS idx_user_profiles_social_links ON user_profiles USING gin(social_links);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_headers ON webhook_configs USING gin(headers);
CREATE INDEX IF NOT EXISTS idx_webhook_events_payload ON webhook_events USING gin(payload);
CREATE INDEX IF NOT EXISTS idx_webhook_events_headers ON webhook_events USING gin(headers);
CREATE INDEX IF NOT EXISTS idx_webhook_events_response ON webhook_events USING gin(response);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_response ON webhook_deliveries USING gin(response);
CREATE INDEX IF NOT EXISTS idx_system_metrics_network_usage ON system_metrics USING gin(network_usage);
CREATE INDEX IF NOT EXISTS idx_system_metrics_metadata ON system_metrics USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_application_metrics_metadata ON application_metrics USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_analytics_dimensions ON analytics USING gin(dimensions);
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata ON audit_logs USING gin(metadata);

-- Create views for common queries
CREATE OR REPLACE VIEW active_media AS
SELECT * FROM media WHERE status = 'PROCESSED';

CREATE OR REPLACE VIEW published_posts AS
SELECT * FROM draft_posts WHERE status = 'PUBLISHED';

CREATE OR REPLACE VIEW active_workflows AS
SELECT * FROM workflow_executions WHERE status IN ('PENDING', 'RUNNING');

CREATE OR REPLACE VIEW failed_workflows AS
SELECT * FROM workflow_executions WHERE status = 'FAILED';

CREATE OR REPLACE VIEW recent_activity AS
SELECT 
    'media' as type,
    id,
    title as name,
    created_at,
    org_id
FROM media
WHERE created_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
    'post' as type,
    id,
    title as name,
    created_at,
    org_id
FROM draft_posts
WHERE created_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
    'workflow' as type,
    id,
    name,
    created_at,
    org_id
FROM workflow_executions
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_microclips_updated_at BEFORE UPDATE ON microclips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_draft_posts_updated_at BEFORE UPDATE ON draft_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_posts_updated_at BEFORE UPDATE ON scheduled_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON competitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitor_posts_updated_at BEFORE UPDATE ON competitor_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_reviews_updated_at BEFORE UPDATE ON workflow_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_executions_updated_at BEFORE UPDATE ON workflow_executions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_comments_updated_at BEFORE UPDATE ON community_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhook_configs_updated_at BEFORE UPDATE ON webhook_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhook_events_updated_at BEFORE UPDATE ON webhook_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON alert_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Clean up old system metrics (keep last 30 days)
    DELETE FROM system_metrics WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- Clean up old application metrics (keep last 30 days)
    DELETE FROM application_metrics WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- Clean up old webhook events (keep last 7 days)
    DELETE FROM webhook_events WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Clean up old webhook deliveries (keep last 7 days)
    DELETE FROM webhook_deliveries WHERE delivered_at < NOW() - INTERVAL '7 days';
    
    -- Clean up old audit logs (keep last 90 days)
    DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Clean up old analytics (keep last 1 year)
    DELETE FROM analytics WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Clean up resolved alerts (keep last 30 days)
    DELETE FROM alerts WHERE resolved = true AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to get organization statistics
CREATE OR REPLACE FUNCTION get_organization_stats(org_id_param TEXT)
RETURNS TABLE (
    total_media BIGINT,
    total_posts BIGINT,
    total_workflows BIGINT,
    active_workflows BIGINT,
    total_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM media WHERE media.org_id = org_id_param) as total_media,
        (SELECT COUNT(*) FROM draft_posts WHERE draft_posts.org_id = org_id_param) as total_posts,
        (SELECT COUNT(*) FROM workflow_executions WHERE workflow_executions.org_id = org_id_param) as total_workflows,
        (SELECT COUNT(*) FROM workflow_executions WHERE workflow_executions.org_id = org_id_param AND workflow_executions.status IN ('PENDING', 'RUNNING')) as active_workflows,
        (SELECT COUNT(*) FROM user_organizations WHERE user_organizations.org_id = org_id_param) as total_users;
END;
$$ LANGUAGE plpgsql;

-- Create function to search media
CREATE OR REPLACE FUNCTION search_media(
    org_id_param TEXT,
    search_query TEXT DEFAULT '',
    status_filter TEXT DEFAULT NULL,
    limit_param INTEGER DEFAULT 20,
    offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
    id TEXT,
    title TEXT,
    description TEXT,
    status TEXT,
    created_at TIMESTAMP,
    tags TEXT[],
    hashtags TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.title,
        m.description,
        m.status::TEXT,
        m.created_at,
        m.tags,
        m.hashtags
    FROM media m
    WHERE m.org_id = org_id_param
    AND (search_query = '' OR to_tsvector('english', m.title || ' ' || COALESCE(m.description, '')) @@ plainto_tsquery('english', search_query))
    AND (status_filter IS NULL OR m.status::TEXT = status_filter)
    ORDER BY m.created_at DESC
    LIMIT limit_param
    OFFSET offset_param;
END;
$$ LANGUAGE plpgsql;

-- Create function to get workflow execution status
CREATE OR REPLACE FUNCTION get_workflow_execution_status(execution_id_param TEXT)
RETURNS TABLE (
    id TEXT,
    name TEXT,
    status TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error TEXT,
    total_steps BIGINT,
    completed_steps BIGINT,
    failed_steps BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        we.id,
        we.name,
        we.status::TEXT,
        we.started_at,
        we.completed_at,
        we.error,
        (SELECT COUNT(*) FROM workflow_steps WHERE workflow_steps.execution_id = execution_id_param) as total_steps,
        (SELECT COUNT(*) FROM workflow_steps WHERE workflow_steps.execution_id = execution_id_param AND workflow_steps.status = 'COMPLETED') as completed_steps,
        (SELECT COUNT(*) FROM workflow_steps WHERE workflow_steps.execution_id = execution_id_param AND workflow_steps.status = 'FAILED') as failed_steps
    FROM workflow_executions we
    WHERE we.id = execution_id_param;
END;
$$ LANGUAGE plpgsql;

-- Insert initial data
INSERT INTO alert_rules (id, name, condition, threshold, severity, enabled, actions, created_at, updated_at) VALUES
('cpu_high', 'High CPU Usage', 'cpu.usage', 80.0, 'high', true, ARRAY['email', 'slack'], NOW(), NOW()),
('memory_high', 'High Memory Usage', 'memory.usage', 85.0, 'high', true, ARRAY['email', 'slack'], NOW(), NOW()),
('disk_high', 'High Disk Usage', 'disk.usage', 90.0, 'critical', true, ARRAY['email', 'slack', 'webhook'], NOW(), NOW()),
('error_rate_high', 'High Error Rate', 'error.rate', 5.0, 'high', true, ARRAY['email', 'slack'], NOW(), NOW()),
('response_time_high', 'High Response Time', 'response.time', 1000.0, 'medium', true, ARRAY['email'], NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create sample workflow templates
INSERT INTO workflow_templates (id, title, description, category, tags, content, is_public, is_featured, price, currency, status, created_by, created_at, updated_at) VALUES
('social_media_automation', 'Social Media Automation', 'Automatically post content to multiple social media platforms', 'social_media', ARRAY['automation', 'social', 'posting'], '{"steps": [{"type": "trigger", "name": "Schedule Trigger"}, {"type": "action", "name": "Post to Instagram"}, {"type": "action", "name": "Post to Facebook"}]}', true, true, 0.0, 'USD', 'ACTIVE', 'system', NOW(), NOW()),
('content_generation', 'AI Content Generation', 'Generate social media content using AI', 'content_creation', ARRAY['ai', 'content', 'generation'], '{"steps": [{"type": "trigger", "name": "Manual Trigger"}, {"type": "action", "name": "Generate Content"}, {"type": "action", "name": "Generate Hashtags"}]}', true, true, 29.99, 'USD', 'ACTIVE', 'system', NOW(), NOW()),
('analytics_reporting', 'Analytics and Reporting', 'Generate automated analytics reports', 'analytics', ARRAY['analytics', 'reporting', 'automation'], '{"steps": [{"type": "trigger", "name": "Weekly Schedule"}, {"type": "action", "name": "Collect Analytics"}, {"type": "action", "name": "Generate Report"}, {"type": "action", "name": "Send Email"}]}', true, false, 49.99, 'USD', 'ACTIVE', 'system', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create sample community posts
INSERT INTO community_posts (id, title, content, type, tags, created_by, created_at, updated_at) VALUES
('welcome_post', 'Welcome to Autolanka!', 'Welcome to the Autolanka community! This is a place where you can share your automation workflows, ask questions, and learn from other users.', 'announcement', ARRAY['welcome', 'community', 'getting-started'], 'system', NOW(), NOW()),
('getting_started_guide', 'Getting Started with Autolanka', 'Here is a comprehensive guide to help you get started with Autolanka and make the most of its features.', 'discussion', ARRAY['guide', 'getting-started', 'tutorial'], 'system', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE autolanka_dev TO autolanka;
GRANT ALL PRIVILEGES ON SCHEMA public TO autolanka;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO autolanka;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO autolanka;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO autolanka;

-- Create a scheduled job to clean up old data (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data();');

COMMIT;
