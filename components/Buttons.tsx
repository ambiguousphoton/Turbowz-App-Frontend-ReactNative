import React ,{ useState }from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

interface Props {
    text: string;
    onPress?: () => void;
    clicked?: boolean;
    fullWidth?: boolean;
}

interface SecondaryProps extends Props {
    fullWidth?: boolean;
}

const PrimaryButtonComponent: React.FC<Props> = ({ text, onPress, clicked = false, fullWidth = true }) => {
    return (
        <TouchableOpacity className={`${clicked ? 'bg-gray-100' : 'bg-primary-150'} rounded-2xl justify-center items-center py-2 px-4 ${fullWidth ? 'flex-1' : ''}`} onPress={onPress}>
            <Text className={`${clicked ? 'text-black' : 'text-white'} font-semibold`}>{text}</Text>
        </TouchableOpacity>
    );
};

export default PrimaryButtonComponent;


export const SecondaryButtonComponent: React.FC<SecondaryProps> = ({ text, onPress, fullWidth = true }) => {
    return (
        <TouchableOpacity className={`bg-select rounded-2xl justify-center items-center py-2 px-4 ${fullWidth ? 'flex-1' : ''}`} onPress={onPress}>
            <Text className=" font-semibold">{text}</Text>
        </TouchableOpacity>
    );
};



export const DescriptionComponent = ({ description, maxLength = 5 }: { description: string | undefined; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) return null;
  
  const shouldTruncate = description.length > maxLength;
  const displayText = isExpanded || !shouldTruncate ? description : description.substring(0, maxLength) + '...';

  return (
    <View >
      <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} disabled={!shouldTruncate}>
        <Text>
          <Text className="text-gray-600 text-sm">{displayText}</Text>
          {shouldTruncate && <Text className="text-gray-400"> {isExpanded ? "show less" : "show more"}</Text>}
        </Text>
      </TouchableOpacity>
    </View>
  );
}


