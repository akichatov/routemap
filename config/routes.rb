Routemap::Application.routes.draw do
  root to: "tracks#index" 
  devise_for :users, controllers: { omniauth_callbacks: "users/omniauth_callbacks" }
  devise_scope :user do
    get 'sign_out' => 'devise/sessions#destroy', :as => :destroy_user_session
  end
  resources :tracks
end
