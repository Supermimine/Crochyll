import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ShopView from '../views/ShopView.vue'
import AmigurumiView from '../views/AmigurumiView.vue'
import ClotheView from '../views/ClotheView.vue'
import PatternView from '@/views/PatternView.vue'
import DetailView from '../views/DetailView.vue'
import MakerView from '../views/MakerView.vue'
import CartView from '../views/CartView.vue'
import CustomItemView from '../views/CustomItemView.vue'
import ReaderView from '../views/ReaderView.vue'
import FaqView from '../views/FaqView.vue'
import PolicyView from '../views/PolicyView.vue'
import LearnView from '../views/LearnView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/shop', name: 'Shop', component: ShopView },
  { path: '/shop/amigurumi', name: 'Amigurumi', component: AmigurumiView },
  { path: '/shop/amigurumi/:id', name: 'DetailAmigurumi', component: DetailView },
  { path: '/shop/clothe', name: 'Clothe', component: ClotheView },
  { path: '/shop/clothe/:id', name: 'DetailClothe', component: DetailView },
  { path: '/shop/pattern', name: 'Pattern', component: PatternView },
  { path: '/shop/pattern/:id', name: 'DetailPattern', component: DetailView },
  { path: '/shop/custom', name: 'CustomItem', component: CustomItemView },
  { path: '/cart', name: 'Cart', component: CartView },
  { path: '/maker', name: 'Maker', component: MakerView },
  { path: '/reader', name: 'Reader', component: ReaderView },
  { path: '/faq', name: 'Faq', component: FaqView },
  { path: '/policy', name: 'Policy', component: PolicyView },
  { path: '/learn', name: 'Learn', component: LearnView },
  
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});