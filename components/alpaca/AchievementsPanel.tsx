import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useQuests } from "@/hooks/useQuests";
import { memo } from "react";

const AchievementsPanel = memo(function AchievementsPanel() {
  const { achievements, unlockedAchievements, isLoading } = useQuests();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading achievements...</div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Achievements
          <span className="text-sm font-normal text-gray-500">
            {unlockedAchievements}/{achievements.length} unlocked
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`border rounded-lg p-3 transition-all duration-300 hover:shadow-md ${
                achievement.isUnlocked 
                  ? 'border-green-200 bg-green-50 shadow-sm hover:shadow-green-100' 
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`text-2xl transition-all duration-300 ${
                  achievement.isUnlocked 
                    ? 'transform hover:scale-110 drop-shadow-sm' 
                    : 'grayscale opacity-50'
                }`}>
                  {achievement.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-semibold text-sm ${
                      achievement.isUnlocked ? 'text-green-800' : 'text-gray-700'
                    }`}>
                      {achievement.title}
                    </h4>
                    
                    {achievement.isUnlocked && (
                      <span className="text-xs text-green-600 font-medium">
                        ✅ Unlocked
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-xs mb-2 ${
                    achievement.isUnlocked ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {achievement.description}
                  </p>
                  
                  {/* Progress Bar */}
                  {!achievement.isUnlocked && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {achievement.progress}/{achievement.target}
                      </span>
                    </div>
                  )}
                  
                  {/* Unlock Date */}
                  {achievement.isUnlocked && achievement.unlockedAt && (
                    <div className="text-xs text-green-600">
                      Unlocked on {formatDate(achievement.unlockedAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {achievements.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No achievements available.
            </div>
          )}
        </div>
        
        {/* Achievement Stats */}
        <div className="mt-4 pt-3 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">{unlockedAchievements}</div>
              <div className="text-xs text-gray-500">Unlocked</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-600">
                {Math.round((unlockedAchievements / achievements.length) * 100)}%
              </div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export { AchievementsPanel };