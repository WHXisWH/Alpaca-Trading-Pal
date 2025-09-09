export enum QuestType {
  FEED_ALPACA = 'feed_alpaca',
  COMPLETE_TRADE = 'complete_trade',
  WIN_TRADE = 'win_trade',
  EQUIP_ITEM = 'equip_item',
  VISIT_PROFILE = 'visit_profile',
}

export enum QuestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',  
  COMPLETED = 'completed',
  CLAIMED = 'claimed',
}

export enum AchievementType {
  LEVEL_MILESTONE = 'level_milestone',
  TRADE_COUNT = 'trade_count',
  WIN_STREAK = 'win_streak',
  ALPACA_COLLECTION = 'alpaca_collection',
  ITEM_COLLECTION = 'item_collection',
}

export interface QuestReward {
  type: 'xp' | 'item';
  amount?: number; // For XP
  itemId?: number; // For items
  itemAmount?: number;
}

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  progress: number;
  target: number;
  status: QuestStatus;
  reward: QuestReward;
  expiresAt: Date;
}

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  progress: number;
  target: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  icon: string; // Emoji or icon identifier
}

export interface QuestProgress {
  [questId: string]: {
    progress: number;
    status: QuestStatus;
    lastUpdated: Date;
  };
}

export interface AchievementProgress {
  [achievementId: string]: {
    progress: number;
    isUnlocked: boolean;
    unlockedAt?: Date;
  };
}

export interface DailyQuestData {
  date: string; // YYYY-MM-DD format
  quests: Quest[];
  lastReset: Date;
}