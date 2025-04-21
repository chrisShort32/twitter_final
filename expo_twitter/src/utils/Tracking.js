import AsyncStorage from "@react-native-async-storage/async-storage";

const getUserId = async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user).username : null;
};

export const addScreenView = async (screenName) => {
    const userId = await getUserId();
    if (!userId) return;

    const key = `screenViews-${userId}`;
    const views = JSON.parse(await AsyncStorage.getItem(key)) || [];
    views.push(screenName);
    await AsyncStorage.setItem(key, JSON.stringify(views));
};

export const incrementButtonStat = async (action) => {
    const userId = await getUserId();
    if (!userId) return;

    const key = `buttonStats-${userId}`;
    const stats = JSON.parse(await AsyncStorage.getItem(key)) || {};
    stats[action] = (stats[action] || 0) + 1;
    await AsyncStorage.setItem(key, JSON.stringify(stats)); 
};

let screenStartTime = null;
export const startScreenTimer = () => {
    screenStartTime = Date.now();
};

export const stopScreenTimer = async (screenName) => {
    if (!screenStartTime) return;
    const duration = Date.now() - screenStartTime;

    const userId = await getUserId();
    if (!userId) return;

    const key = `timeSpent-${userId}`;
    const timeData = JSON.parse(await AsyncStorage.getItem(key)) || {};
    timeData[screenName] = (timeData[screenName] || 0) + duration;
    await AsyncStorage.setItem(key, JSON.stringify(timeData));
    screenStartTime = null;
};

export const addRecentSearch = async (searchTerm) => {
    const userId = await getUserId();
    if (!userId) return;

    const key = `recentSearches-${userId}`;
    const searches = JSON.parse(await AsyncStorage.getItem(key)) || [];
    const updated = [searchTerm, ...searches.filter(term => term !== searchTerm)];
    await AsyncStorage.setItem(key, JSON.stringify(updated.slice(0,5)));
};

export const setLocationToggle = async (enabled) => {
    const userId = await getUserId();
    if (!userId) return;

    const key = `locationToggle-${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify({enabled, timestamp: Date.now()}));
};
