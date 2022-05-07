class ProductsController < ApplicationController
  before_action :find_own_product, only: %i[own]
  before_action :find_product, only: %i[show edit update destroy]
  before_action :pundit
  rescue_from Pundit::NotAuthorizedError, with: :no_permission
  def index
    @products = Product.all
  end

  def show
  end

  def new
    @product = Product.new
  end

  def create
    @product = current_user.products.new(product_params)
      if @product.save
        redirect_to own_products_path, notice: 'Create Sussess!!'
      else
        render :new
      end
  end

  def edit
  end

  def update
    if @product.update(product_params)
      redirect_to own_products_path, notice: "Update Sussess!!"
    else
      render :edit
    end
  end

  def destroy
    @product.destroy
    redirect_to own_products_path, notice: "Delete Sussess!!"
  end

  def own
  end

  private

  def product_params
    params.require(:product).permit(:name,:description,:start_price,:direct_price,:status)
  end

  def find_product
    @product = Product.find(params[:id])
  end

  def find_own_product

    @products = current_user.products
  end

  def pundit
    authorize :product
  end

  def no_permission
    flash[:alert] = '請先驗證手機號碼，才能啟用賣場功能。'
    redirect_to new_sms_auth_registration_path
  end
end
