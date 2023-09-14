import { combineReducers } from 'redux';
import connectionDetailsReducer from './connectionDetailsReducer';
import cartReducer from './cartReducer';
 
// Combine all the reducers
const rootReducer = combineReducers({
    connectionDetailsReducer,
    cartReducer
})
 
export default rootReducer;