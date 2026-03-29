import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { format, startOfWeek } from 'date-fns';

interface ActivityHeatmapProps {
  activityData?: {
    VideoUploads?: Record<string, number>;
    EcoUploads?: Record<string, number>;
  };
}

const ActivityHeatmap = ({ activityData }: ActivityHeatmapProps) => {

  const { heatmapData, streaks } = useMemo(() => {
    if (!activityData) {
      return { heatmapData: { weeks: [], monthLabels: [] }, streaks: { current: 0, longest: 0 } };
    }

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 89); // Last 90 days
    
    // Create grid starting from first Sunday of the period
    const startSunday = startOfWeek(startDate, { weekStartsOn: 0 });
    
    // Calculate total weeks needed
    const totalDays = Math.ceil((today.getTime() - startSunday.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalWeeks = Math.ceil(totalDays / 7);
    
    const weeks: any[][] = [];
    const monthLabels: { index: number; month: string; width: number }[] = [];
    
    // Build weeks grid
    for (let week = 0; week < totalWeeks; week++) {
      const weekDays: any[] = [];
      
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startSunday);
        currentDate.setDate(startSunday.getDate() + (week * 7) + day);
        
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        
        if (currentDate > todayEnd) {
          weekDays.push({ intensity: -1 });
          continue;
        }
        
        if (currentDate < startDate) {
          weekDays.push({ intensity: -1 });
          continue;
        }
        
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const videoCount = activityData.VideoUploads?.[dateStr] || 0;
        const ecoCount = activityData.EcoUploads?.[dateStr] || 0;
        const total = videoCount + ecoCount;
        
        const intensity = total === 0 ? 0 : total <= 2 ? 1 : total <= 5 ? 2 : total <= 10 ? 3 : 4;
        
        // Debug today's data
        if (dateStr === format(today, 'yyyy-MM-dd')) {
          // Activity data for today
        }
        
        weekDays.push({
          date: dateStr,
          count: total,
          intensity,
          month: currentDate.getMonth()
        });
      }
      
      weeks.push(weekDays);
    }
    
    // Calculate month labels with proper positioning
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let currentMonth = -1;
    let monthStartWeek = 0;
    
    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find(day => day.date);
      if (firstValidDay) {
        const date = new Date(firstValidDay.date);
        const month = date.getMonth();
        
        if (month !== currentMonth) {
          if (currentMonth !== -1) {
            // Close previous month
            monthLabels[monthLabels.length - 1].width = weekIndex - monthStartWeek;
          }
          
          currentMonth = month;
          monthStartWeek = weekIndex;
          monthLabels.push({
            index: weekIndex,
            month: months[month],
            width: 1
          });
        }
      }
    });
    
    // Close last month
    if (monthLabels.length > 0) {
      monthLabels[monthLabels.length - 1].width = weeks.length - monthStartWeek;
    }

    // Calculate streaks
    const allDates = [];
    
    // Get all dates with activity in chronological order
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const videoCount = activityData.VideoUploads?.[dateStr] || 0;
      const ecoCount = activityData.EcoUploads?.[dateStr] || 0;
      const total = videoCount + ecoCount;
      allDates.push({ date: dateStr, hasActivity: total > 0 });
    }
    
    // Calculate current streak (from today backwards)
    let currentStreak = 0;
    for (let i = allDates.length - 1; i >= 0; i--) {
      if (allDates[i].hasActivity) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    
    allDates.forEach(day => {
      if (day.hasActivity) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    return { 
      heatmapData: { weeks, monthLabels }, 
      streaks: { current: currentStreak, longest: longestStreak }
    };
  }, [activityData]);

  return (
    <View className="mb-6 px-2">
      <Text className="text-sm font-medium text-gray-600 mb-3 ">
        Last 90 Days
      </Text>

      <View className="flex-row px-5">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
        <View>
          {/* Month labels */}
          <View className="flex-row mb-1" style={{ marginLeft: 20 }}>
            {heatmapData.monthLabels.map((label, index) => (
              <Text
                key={index}
                className="text-xs text-gray-500"
                style={{ 
                  width: label.width * 13,
                  textAlign: 'left'
                }}
              >
                {label.month}
              </Text>
            ))}
          </View>
          
          <View className="flex-row ">
            {/* Day labels */}
            <View className="mr-2">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                <Text
                  key={i}
                  className="text-xs text-gray-500 mb-0.5"
                  style={{ height: 13, lineHeight: 13 }}
                >
                  {i % 2 === 1 ? d.slice(0,3) : ''}
                </Text>
              ))}
            </View>

            {/* Heatmap */}
            <View className="flex-row ">
              {heatmapData.weeks.map((week, wi) => (
                <View key={wi} className="mr-0.5">
                  {week.map((day, di) => {
                    const backgroundColor = 
                      day.intensity === -1 ? 'transparent' :
                      day.intensity === 0 ? '#DBFCFF' :
                      day.intensity === 1 ? '#FFADEE' :
                      day.intensity === 2 ? '#FE68CE' :
                      day.intensity === 3 ? '#FF0090' :
                      '#0099CC';
                    
                    return (
                      <View
                        key={`${wi}-${di}`}
                        style={{ 
                          width: 11, 
                          height: 11, 
                          marginBottom: 2, 
                          borderRadius: 2,
                          backgroundColor 
                        }}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
        </ScrollView>
        
        {/* Streak Stats */}
        <View className="ml-6 justify-center">
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-black">{streaks.current}</Text>
            <Text className="text-xs text-gray-500 text-center">Current Streak</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-black">{streaks.longest}</Text>
            <Text className="text-xs text-gray-500 text-center">Longest Streak</Text>
          </View>
        </View>
      </View>

      {/* Legend */}
      <View className="flex-row justify-between items-center mt-3">
        <Text className="text-xs text-gray-500">Less</Text>
        <View className="flex-row items-center">
          {[0,1,2,3].map(level => (
            <View
              key={level}
              className="mx-0.5 rounded-sm"
              style={{
                width: 11,
                height: 11,
                backgroundColor:
                  level === 0 ? '#DBFCFF' :
                  level === 1 ? '#FFADEE' :
                  level === 2 ? '#FE68CE' :
                  level >= 3  ? '#FF0090' : '#FF0090'
              }}
            />
          ))}
        </View>
        <Text className="text-xs text-gray-500">More</Text>
      </View>
    </View>
  );
};

export default ActivityHeatmap;