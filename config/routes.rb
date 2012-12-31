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
  end
  post 'tracks/multi_view', to: 'tracks#multi_view'
  resources :tags, only: [:show] do
    resources :tracks
  end
end
