Routemap::Application.routes.draw do
  devise_for :users, controllers: { omniauth_callbacks: "users/omniauth_callbacks" }
  devise_scope :user do
    get 'sign_out' => 'devise/sessions#destroy', as: :destroy_user_session
  end
  authenticated :user do
    root to: 'tracks#index'
  end
  root to: "home#index"
  resources :tracks do
    resources :partitions, only: [:new, :create]
    resources :photos, only: :index
  end
  resources :tags, only: [:show, :edit, :update] do
    resources :tracks
    resources :photos, only: :index
  end
  resources :photos
  post 'tracks/multi_view', to: 'tracks#multi_view'
  post 'tracks/:id/slice', to: 'tracks#slice', as: :slice_track
  post 'tracks/:id/save_slice', to: 'tracks#save_slice', as: :save_slice_track
end
