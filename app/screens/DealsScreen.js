import React, { useEffect } from 'react';
import { Text } from 'react-native';
import SearchDealsResults from '../components/SearchDealsResults';

const DealsScreen = ({ navigation, route }) => {

    useEffect(() => {
        let title = route.params.deals.length === 1 ? 'נמצאה עסקה אחת' : `נמצאו ${route.params.deals.length} עסקאות`;
        navigation.setOptions({ headerRight: () => <Text style={{ fontSize: 21, fontFamily: 'simpler-regular-webfont' }}>{title}</Text> })
    }, []);

    return (
        <SearchDealsResults dealsData={route.params.deals} navigation={navigation} refreshDeals={route.params.refreshDeals} />
    );
};

export default DealsScreen