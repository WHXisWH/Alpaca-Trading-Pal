import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useQuests } from "@/hooks/useQuests";
import { QuestStatus } from "@/types/quests";
import { QuestsPanelSkeleton } from "@/components/ui/QuestsPanelSkeleton";
import { memo } from "react";

const QuestsPanel = memo(function QuestsPanel() {
  const { dailyQuests, completedQuests, claimQuestReward, isLoading } = useQuests();

  if (isLoading) {
    return <QuestsPanelSkeleton />;
  }

  const getStatusIcon = (status: QuestStatus) => {
    switch (status) {
      case QuestStatus.PENDING:
        return '⏳';
      case QuestStatus.IN_PROGRESS:
        return '🔄';
      case QuestStatus.COMPLETED:
        return '✅';
      case QuestStatus.CLAIMED:
        return '🎁';
      default:
        return '❓';
    }
  };

  const getRewardText = (reward: any) => {
    if (reward.type === 'xp') {
      return `${reward.amount} XP`;
    } else if (reward.type === 'item') {
      const itemNames: { [key: number]: string } = {
        1: 'Crystal Ball',
        2: 'Trading Terminal', 
        101: 'Knowledge Capsule',
      };
      return `${reward.itemAmount}x ${itemNames[reward.itemId] || 'Item'}`;
    }
    return 'Reward';
  };

  const handleClaimReward = (questId: string) => {
    claimQuestReward(questId);
    // Here you could also actually give the reward to the user
    // For now, we'll just mark it as claimed in the quest system
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Daily Quests
          <span className="text-sm font-normal text-gray-500">
            {completedQuests}/{dailyQuests.length} completed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dailyQuests.map((quest) => (
            <div key={quest.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getStatusIcon(quest.status)}</span>
                    <h4 className="font-semibold text-sm">{quest.title}</h4>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{quest.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      {quest.progress}/{quest.target}
                    </span>
                  </div>
                  
                  {/* Reward */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-600 font-medium">
                      🎁 {getRewardText(quest.reward)}
                    </span>
                    
                    {quest.status === QuestStatus.COMPLETED && (
                      <button
                        onClick={() => handleClaimReward(quest.id)}
                        className="px-3 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-all duration-200 min-h-[32px] min-w-[48px] touch-manipulation animate-pulse hover:scale-105 hover:shadow-lg"
                      >
                        🎉 Claim
                      </button>
                    )}
                    
                    {quest.status === QuestStatus.CLAIMED && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        Claimed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {dailyQuests.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No daily quests available. Check back tomorrow!
            </div>
          )}
        </div>
        
        {/* Daily Reset Timer */}
        <div className="mt-4 pt-3 border-t">
          <div className="text-center text-xs text-gray-500">
            🔄 Daily quests reset at midnight
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export { QuestsPanel };