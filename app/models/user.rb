class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  # devise :database_authenticatable, :registerable,
  #        :recoverable, :rememberable, :trackable, :validatable
  devise :omniauthable, :rememberable
  attr_accessor :password
  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password #, :password_confirmation, :remember_me

  has_many :tracks, include: [:version, :tag]
  has_many :tags

  def self.find_for_open_id(access_token, signed_in_resource=nil)
    data = access_token.info
    if user = User.where(:email => data["email"]).first
      user
    else
      User.create!(:email => data["email"], :password => Devise.friendly_token[0,20])
    end
  end

  def remember_me
    true
  end

end
