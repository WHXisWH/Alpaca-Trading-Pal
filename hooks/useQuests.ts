import { useState, useEffect, useCallback } from 'react';
import {
  Quest,
  QuestType,
  QuestStatus,
  QuestReward,
  DailyQuestData,
  Achievement,
  AchievementType,
} from '@/types/quests';

const STORAGE_KEY = 'alpaca_daily_quests';
const ACHIEVEMENTS_KEY = 'alpaca_achievements';

// Default daily quests template
const createDailyQuests = (date: string): Quest[] => [
  {
    id: `feed_${date}`,
    type: QuestType.FEED_ALPACA,
    title: 'Feed Your Alpaca',
    description: 'Feed your Alpaca once with knowledge',
    progress: 0,
    target: 1,
    status: QuestStatus.PENDING,
    reward: { type: 'xp', amount: 50 },
    expiresAt: new Date(date + 'T23:59:59'),
  },
  {
    id: `trade_${date}`,
    type: QuestType.COMPLETE_TRADE,
    title: 'Complete a Trade',
    description: 'Record at least one trade result',
    progress: 0,
    target: 1,
    status: QuestStatus.PENDING,
    reward: { type: 'item', itemId: 101, itemAmount: 1 }, // Knowledge Capsule
    expiresAt: new Date(date + 'T23:59:59'),
  },
  {
    id: `visit_${date}`,
    type: QuestType.VISIT_PROFILE,
    title: 'Check Your Alpaca',
    description: 'Visit your Alpaca profile page',
    progress: 0,
    target: 1,
    status: QuestStatus.PENDING,
    reward: { type: 'xp', amount: 25 },
    expiresAt: new Date(date + 'T23:59:59'),
  },
];

// Default achievements
const defaultAchievements: Achievement[] = [
  {
    id: 'first_feed',
    type: AchievementType.TRADE_COUNT,
    title: 'First Steps',
    description: 'Feed your Alpaca for the first time',
    progress: 0,
    target: 1,
    isUnlocked: false,
    icon: '🍼',
  },
  {
    id: 'level_10',
    type: AchievementType.LEVEL_MILESTONE,
    title: 'Growing Up',
    description: 'Reach Level 10 with your Alpaca',
    progress: 0,
    target: 10,
    isUnlocked: false,
    icon: '⭐',
  },
  {
    id: 'win_streak_5',
    type: AchievementType.WIN_STREAK,
    title: 'Lucky Streak',
    description: 'Win 5 trades in a row',
    progress: 0,
    target: 5,
    isUnlocked: false,
    icon: '🔥',
  },
  {
    id: 'trader_bronze',
    type: AchievementType.TRADE_COUNT,
    title: 'Bronze Trader',
    description: 'Complete 50 trades',
    progress: 0,
    target: 50,
    isUnlocked: false,
    icon: '🥉',
  },
];

export function useQuests() {
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Load quests from localStorage
  const loadQuests = useCallback(() => {
    const today = getTodayString();
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      try {
        const data: DailyQuestData = JSON.parse(stored);
        
        // Check if we need to reset for a new day
        if (data.date !== today) {
          const newQuests = createDailyQuests(today);
          const newData: DailyQuestData = {
            date: today,
            quests: newQuests,
            lastReset: new Date(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
          setDailyQuests(newQuests);
        } else {
          setDailyQuests(data.quests);
        }
      } catch (error) {
        console.error('Failed to parse quest data:', error);
        const newQuests = createDailyQuests(today);
        setDailyQuests(newQuests);
      }
    } else {
      const newQuests = createDailyQuests(today);
      const newData: DailyQuestData = {
        date: today,
        quests: newQuests,
        lastReset: new Date(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setDailyQuests(newQuests);
    }
  }, []);

  // Load achievements from localStorage
  const loadAchievements = useCallback(() => {
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
    
    if (stored) {
      try {
        const storedAchievements: Achievement[] = JSON.parse(stored);
        setAchievements(storedAchievements);
      } catch (error) {
        console.error('Failed to parse achievements data:', error);
        setAchievements(defaultAchievements);
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(defaultAchievements));
      }
    } else {
      setAchievements(defaultAchievements);
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(defaultAchievements));
    }
  }, []);

  // Update quest progress
  const updateQuestProgress = useCallback((questType: QuestType, increment: number = 1) => {
    setDailyQuests(prev => {
      const updated = prev.map(quest => {
        if (quest.type === questType && quest.status !== QuestStatus.COMPLETED) {
          const newProgress = Math.min(quest.progress + increment, quest.target);
          const newStatus = newProgress >= quest.target ? QuestStatus.COMPLETED : QuestStatus.IN_PROGRESS;
          
          return {
            ...quest,
            progress: newProgress,
            status: newStatus,
          };
        }
        return quest;
      });

      // Save to localStorage
      const today = getTodayString();
      const newData: DailyQuestData = {
        date: today,
        quests: updated,
        lastReset: new Date(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

      return updated;
    });
  }, []);

  // Update achievement progress
  const updateAchievementProgress = useCallback((achievementId: string, progress: number) => {
    setAchievements(prev => {
      const updated = prev.map(achievement => {
        if (achievement.id === achievementId && !achievement.isUnlocked) {
          const newProgress = Math.min(progress, achievement.target);
          const isUnlocked = newProgress >= achievement.target;
          
          return {
            ...achievement,
            progress: newProgress,
            isUnlocked,
            unlockedAt: isUnlocked ? new Date() : undefined,
          };
        }
        return achievement;
      });

      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Claim quest reward
  const claimQuestReward = useCallback((questId: string) => {
    setDailyQuests(prev => {
      const updated = prev.map(quest => {
        if (quest.id === questId && quest.status === QuestStatus.COMPLETED) {
          return {
            ...quest,
            status: QuestStatus.CLAIMED,
          };
        }
        return quest;
      });

      // Save to localStorage
      const today = getTodayString();
      const newData: DailyQuestData = {
        date: today,
        quests: updated,
        lastReset: new Date(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

      return updated;
    });
  }, []);

  // Track common actions for quest/achievement progress
  const trackAction = useCallback((action: string, metadata?: any) => {
    switch (action) {
      case 'feed_alpaca':
        updateQuestProgress(QuestType.FEED_ALPACA);
        updateAchievementProgress('first_feed', 1);
        break;
      
      case 'complete_trade':
        updateQuestProgress(QuestType.COMPLETE_TRADE);
        // You could track total trade count here
        break;
      
      case 'win_trade':
        updateQuestProgress(QuestType.WIN_TRADE);
        // Track win streak
        break;
      
      case 'visit_profile':
        updateQuestProgress(QuestType.VISIT_PROFILE);
        break;
      
      case 'equip_item':
        updateQuestProgress(QuestType.EQUIP_ITEM);
        break;
      
      case 'level_up':
        if (metadata?.level) {
          updateAchievementProgress('level_10', metadata.level);
        }
        break;
    }
  }, [updateQuestProgress, updateAchievementProgress]);

  // Initialize data on mount
  useEffect(() => {
    setIsLoading(true);
    loadQuests();
    loadAchievements();
    setIsLoading(false);
  }, [loadQuests, loadAchievements]);

  const completedQuests = dailyQuests.filter(q => q.status === QuestStatus.COMPLETED).length;
  const unlockedAchievements = achievements.filter(a => a.isUnlocked).length;

  return {
    dailyQuests,
    achievements,
    completedQuests,
    unlockedAchievements,
    isLoading,
    updateQuestProgress,
    updateAchievementProgress,
    claimQuestReward,
    trackAction,
    refreshQuests: loadQuests,
  };
}