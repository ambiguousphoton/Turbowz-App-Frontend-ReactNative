import VideoCard from "@/components/VideoCardCompnent";
import {FlatList, useWindowDimensions } from "react-native";
import { VideoCardInterface } from '@/interfaces/interfaces'

export const VideoResultContainer =({videos}:any) => {        
    const { width } = useWindowDimensions();
    const numColumns = width > 600 ? 2 : 1;

    
    return (

        <FlatList
          data={videos}
          
          renderItem={({item}) =>( <VideoCard {...item}/> )}
          
          keyExtractor={(item) => item.VideoURL}
          numColumns={numColumns}
          
        //   numColumns={3}
          
        //   columnWrapperStyle = {
        //     {
        //       justifyContent: 'flex-start',
        //       gap:20,
        //       paddingRight:5,
        //       marginBottom: 10,

        //     }
            
        //   }
        //   className="mt-2 pb-32"
          
        //   scrollEnabled={false}
          />
        )
}