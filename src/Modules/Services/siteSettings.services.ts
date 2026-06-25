import { AppDataSource } from "../../Config/database";
import { SiteSettings } from "../../Entities/SiteSettings";
import { AuditLog, AuditAction, AuditEntity } from "../../Entities/Auditlog";

const settingsRepo = () => AppDataSource.getRepository(SiteSettings);
const auditRepo = () => AppDataSource.getRepository(AuditLog);

export class SiteSettingsService {

  // ── Get settings (always returns one record) ──
  async get() {
    let settings = await settingsRepo().findOne({
      where: { isActive: true },
      relations: { updatedBy: true },
    });

    // If no settings exist create defaults
    if (!settings) {
      settings = settingsRepo().create({ isActive: true });
      await settingsRepo().save(settings);
    }

    return settings;
  }

  // ── Update ──
  async update(data: Partial<SiteSettings>, userId?: string) {
    let settings = await settingsRepo().findOne({ where: { isActive: true } });

    if (!settings) {
      settings = settingsRepo().create({ isActive: true });
    }

    const previous = { ...settings };
    Object.assign(settings, data);
    settings.updatedById = userId || null;
    await settingsRepo().save(settings);

    await auditRepo().save(
      auditRepo().create({
        action: AuditAction.UPDATE,
        entity: AuditEntity.SITE_SETTINGS,
        entityId: settings.id,
        previousValue: previous as any,
        newValue: settings as any,
        performedById: userId,
      })
    );

    return settings;
  }

  // ── Update theme only ──
  async updateTheme(data: {
    themePreset?: any;
    accentColor?: string;
    navBackground?: string;
    displayFont?: any;
  }, userId?: string) {
    return this.update(data, userId);
  }

  // ── Update features only ──
  async updateFeatures(data: {
    showTicker?: boolean;
    showHeroGrid?: boolean;
    showVideoSection?: boolean;
    showNewsletter?: boolean;
    showDefenseColumn?: boolean;
    showTrendingSidebar?: boolean;
    showBreakingBadge?: boolean;
  }, userId?: string) {
    return this.update(data, userId);
  }

  // ── Update social links only ──
  async updateSocial(data: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  }, userId?: string) {
    return this.update(data, userId);
  }

  // ── Update SEO only ──
  async updateSEO(data: {
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: string;
    googleAnalyticsId?: string;
  }, userId?: string) {
    return this.update(data, userId);
  }

  // ── Reset to defaults ──
  async resetToDefaults(userId?: string) {
    const settings = await settingsRepo().findOne({ where: { isActive: true } });
    if (!settings) throw new Error("Settings not found");

    const defaults = {
      themePreset: "DARK_NAVY",
      accentColor: "#00C8E0",
      navBackground: "#15202e",
      displayFont: "BARLOW_CONDENSED",
      showTicker: true,
      showHeroGrid: true,
      showVideoSection: true,
      showNewsletter: true,
      showDefenseColumn: true,
      showTrendingSidebar: true,
      showBreakingBadge: true,
    };

    Object.assign(settings, defaults);
    await settingsRepo().save(settings);

    await auditRepo().save(
      auditRepo().create({
        action: AuditAction.UPDATE,
        entity: AuditEntity.SITE_SETTINGS,
        entityId: settings.id,
        notes: "Reset to defaults",
        performedById: userId,
      })
    );

    return settings;
  }
}