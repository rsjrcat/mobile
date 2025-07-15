import { ActivityIndicator } from "react-native"

const PageLoader = () => {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
    )
}
import { View } from "react-native"
import { COLORS, Colors } from "../constants/colors.js";
import { styles } from "../assets/styles/home.styles"

export default PageLoader;