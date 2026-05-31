# HabitFlow Code Quality Rules

Tài liệu này ghi lại các rule bắt buộc khi code trong dự án HabitFlow. Mục tiêu là giữ code dễ đọc, đúng cấu trúc hiện có, ít bug vặt, và không biến app thành một mớ "chạy được nhưng khó cứu".

## 1. Luôn bám Expo SDK 54

- Trước khi thêm package, API Expo, config native, hoặc sửa `app.json`, đọc đúng docs version: https://docs.expo.dev/versions/v54.0.0/
- Dự án hiện dùng `expo ~54.0.34`, `react-native 0.81.5`, `react 19.1.0`; không tự ý nâng/hạ version nếu chưa có lý do rõ.
- Cài package Expo bằng `npx expo install <package>` để lấy version tương thích SDK 54.
- Không dùng API deprecated nếu docs SDK 54 đã có package thay thế. Ví dụ: ưu tiên package mới khi Expo docs đánh dấu legacy/deprecated.

## 2. Giữ đúng cấu trúc thư mục

Hiện project đang đi theo cấu trúc:

```txt
src/
  app/                 Redux store, typed app-level setup
  components/          Shared UI component
  features/            Feature state, slice, selector, domain logic
  navigation/          Root/Auth/Main/Onboarding navigators
  screens/             Screen-level UI
  services/            API/client/integration layer
  types/               Shared TypeScript types
```

Rule:

- Screen chỉ đặt trong `src/screens/<feature-or-flow>/`.
- State theo feature đặt trong `src/features/<feature>/`, gồm `slice`, `selector`, và logic liên quan.
- Component dùng lại nhiều nơi đặt trong `src/components/`; component chỉ dùng riêng một screen thì để gần screen đó.
- Navigation config chỉ nằm trong `src/navigation/`; không nhét logic nghiệp vụ vào navigator.
- API/client code nằm trong `src/services/`; không gọi API trực tiếp rải rác trong screen.

## 3. TypeScript phải nghiêm túc

- `strict: true` đang bật trong `tsconfig.json`; không tắt strict để né lỗi.
- Tránh `any`. Nếu bắt buộc dùng vì thư viện React Native/Animated khó type, phải cô lập trong phạm vi nhỏ và có comment giải thích.
- Export type rõ ràng cho navigator param list, Redux state, API response, model chính.
- Selector phải nhận `RootState` và nằm trong file selector của feature.
- Không để interface/type không export nếu nó cần dùng ở module khác.

## 4. Navigation phải typed và đơn giản

- Mỗi navigator có `ParamList` riêng, ví dụ `OnboardingStackParamList`.
- Khi dùng `useNavigation`, luôn gắn type navigation prop tương ứng.
- Route name phải khớp chính xác với `ParamList`; không dùng string route không khai báo.
- Root flow giữ rõ 3 tầng: onboarding, auth, main.
- Không dispatch Redux hoặc gọi API phức tạp trong navigator, trừ việc chọn flow bằng selector.

## 5. Redux chỉ chứa app state thật sự

- Slice chỉ chứa state có ý nghĩa toàn app hoặc feature state cần chia sẻ.
- Không đưa state UI tạm thời của một screen vào Redux nếu `useState` là đủ.
- Action name phải mô tả intent nghiệp vụ, ví dụ `completeOnboarding`, `login`, `logout`.
- Selector phải là cách đọc state mặc định từ UI; tránh `state.auth.xxx` trực tiếp ngoài selector.

## 6. UI phải nhất quán với vibe hiện tại

Vibe hiện tại của HabitFlow:

- Dark background: `#0b1326`
- Accent tím/xanh: `#a078ff`, `#6D3BD7`, `#0566d9`, `#d0bcff`
- Success/accent xanh: `#4edea3`
- Text phụ: `#cbc3d7`
- Card glass/dark với border mờ, gradient button, icon MaterialIcons, animation nhẹ.

Rule:

- Không tạo palette mới tùy hứng. Nếu cần màu mới, thêm vào token/theme trước.
- Không hardcode cùng một màu ở nhiều file mới; tạo shared constants/theme khi UI bắt đầu lặp.
- Button chính dùng gradient hoặc style đã thống nhất, không mỗi screen một kiểu.
- Dùng `@expo/vector-icons`/`MaterialIcons` theo phong cách hiện có trước khi thêm icon lib mới.
- Layout mobile phải kiểm tra safe area, spacing, text wrapping, và màn nhỏ.

## 7. Animation phải dọn sạch

- Với `Animated.loop`, `setTimeout`, `InteractionManager`, listener, hoặc request async: luôn cleanup trong `useEffect`.
- Dùng `useNativeDriver: true` cho opacity/transform khi có thể.
- Không animate layout property nặng nếu không cần.
- Không để animation chạy tiếp sau khi navigate khỏi screen.
- Nếu dùng `useNativeDriver: false`, phải có lý do rõ như animating SVG stroke.

## 8. Không để code rác

- Không commit `console.log`, text placeholder như `hehehe`, comment debug, hoặc component rỗng nếu không có TODO rõ.
- Comment phải dùng UTF-8 chuẩn. Không để comment lỗi encoding.
- Không để tên file typo. Ví dụ: nên là `SplashScreen2.tsx`, không phải `SpashScreen2.tsx`.
- Không để import thừa, style không dùng, constant không dùng.
- Không để magic number khó hiểu nếu nó ảnh hưởng layout/animation chính; đặt tên constant.

## 9. Naming convention

- Component/screen: `PascalCase.tsx`
- Hook: `useSomething.ts`
- Slice: `<feature>Slice.ts`
- Selector: `<feature>Selector.ts`
- Type/model: tên rõ domain, ví dụ `User`, `Habit`, `AuthState`
- Function handler trong component: `handleNext`, `handleLogin`, `handleCompleteOnboarding`
- Style key mô tả vai trò UI, không mô tả màu thuần túy nếu vai trò quan trọng hơn.

## 10. Services/API layer

- `src/services/api.ts` phải là nơi cấu hình client/API helpers, không để log tạm.
- Không gọi `fetch` trực tiếp từ nhiều screen. Tạo function service rõ input/output.
- API response phải có type.
- Error handling phải có path rõ: loading, success, empty, error.
- Không hardcode secret/token/base URL trong code. Dùng config/env phù hợp Expo khi cần.

## 11. Component rule

- Screen chịu trách nhiệm layout cấp trang và orchestration.
- Component shared phải nhận props rõ ràng, không đọc Redux nếu không cần.
- Component shared không được biết route cụ thể trừ component navigation chuyên dụng.
- Style đặt cuối file bằng `StyleSheet.create` nếu component còn nhỏ; khi style/token lặp nhiều thì tách module.

## 12. Checklist trước khi xong task

Trước khi coi một task là xong:

- Chạy TypeScript/check phù hợp nếu project có script. Hiện chưa có script test/typecheck, nên cân nhắc thêm khi project lớn hơn.
- Chạy app bằng `npm run start` hoặc platform script khi sửa UI/navigation.
- Kiểm tra không còn `console.log`, placeholder, import thừa.
- Kiểm tra file mới nằm đúng thư mục.
- Kiểm tra tên route và `ParamList` khớp nhau.
- Kiểm tra cleanup animation/effect.
- Kiểm tra UI trên màn nhỏ: text không tràn, button không vỡ, content không bị che bởi safe area.

## 13. Khi thêm dependency

- Chỉ thêm dependency khi thật sự cần.
- Với Expo package: dùng `npx expo install`.
- Với React Navigation/Redux/native package: kiểm tra compatibility với Expo SDK 54 trước.
- Không thêm lib chỉ để giải quyết việc nhỏ có thể làm bằng API sẵn có.

## 14. Definition of Done

Một thay đổi được xem là sạch khi:

- Đúng cấu trúc thư mục hiện tại.
- Không phá typed navigation.
- Không làm loãng Redux bằng UI state tạm.
- Không có code/comment/log rác.
- Có cleanup cho side effect.
- UI giữ cùng vibe HabitFlow.
- Tuân thủ docs Expo SDK 54 khi chạm vào Expo/native behavior.
