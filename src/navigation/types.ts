// src/navigation/types.ts
export type RootStackParamList = {
  Welcome: undefined;
  AuthGate: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Tabs: undefined;
  ProductDetail: { id: number };
  SellerProfile: { id: number };
  CustomerProfile: undefined;
  Map: undefined;
  Reels: undefined;
  Chat: { sellerId: number; sellerName: string } | undefined;
};

export type TabsParamList = {
  Home: undefined;
  Search: undefined;
  Reels: undefined;
  MyProducts: undefined;
  Profile: undefined;
};