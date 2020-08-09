import { combineReducers } from "redux";
import user from "./user_reducer";
// import comment from './comment_reducer'

// 여러 리듀서들을 루트 리듀서에서 합친다.
const rootReducer = combineReducers({
  user,
  // comment,
});

export default rootReducer;
