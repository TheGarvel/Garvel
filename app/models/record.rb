# frozen_string_literal: true

class Record < ApplicationRecord
  belongs_to :buyer
  belongs_to :product
  belongs_to :room
end
