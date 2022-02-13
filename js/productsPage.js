import productModal from "../components/productModal.js";
import {successToast, errorToast, warningToast} from "../js/toastMessage.js";

const apiUrl = "https://vue3-course-api.hexschool.io/v2/api/";
const apiPath = "jimmycai";

const user_productsApp = Vue.createApp({
    data() {
        return{
            products: [],
            product: {},
            // 表單資料
            form: {
                user: {
                    name: "",
                    email: "",
                    tel: "",
                    address: ""
                },
                message: ""
            },
            shoppingCart: {}, // 購物車
            loadingStatus: "", // 按鈕讀取狀態
            isLoading: false, // 頁面讀取狀態
            coupon_code: "" // 優惠券折扣代碼
        }
    },
    methods: {
        // 取得產品資料列
        getProducts() {
            this.isLoading = true;

            axios.get(`${apiUrl}${apiPath}/products`).then(res =>{
                this.products = res.data.products;
                setTimeout(() =>{
                    this.isLoading = false;
                }, 500);
            }).catch(() =>{
                warningToast(`商家目前並沒有販賣任何商品！！`)
            });
        },
        // 開啟單項產品詳細資料(彈跳視窗)
        openUserModal(item) {
            this.loadingStatus = item.id;

            const api = `${apiUrl}${apiPath}/product/${item.id}`;
            axios.get(api).then(res =>{
                this.product = res.data.product;
                this.$refs.userProductModal.openModal();
                this.loadingStatus = '';
            }).catch(err =>{
                errorToast(err.data.message);
            });
        },
        // 讀取購物車資料
        getShoppingCart() {
            const api = `${apiUrl}${apiPath}/cart`;
            axios.get(api).then(res =>{
                this.shoppingCart = res.data.data;
            }).catch(err =>{
                errorToast(err.data.message);
            })
        },
        // 新增購物車資料
        addShoppingCart(id, qty=1) {
            this.isLoading = true;

            const api = `${apiUrl}${apiPath}/cart`;
            const cartObj = {
              data: {
                product_id: id,
                qty
              }
            };
    
            axios.post(api, cartObj).then(res =>{
                this.$refs.userProductModal.closeModal();
                successToast(res.data.message);
                this.getShoppingCart();
                setTimeout(() =>{
                    this.isLoading = false;
                }, 300);

            }).catch(err =>{
                errorToast(err.data.message);
            });
        },
        // 更新購物車資料
        updateShoppingCart(item) {
            this.loadingStatus = item.id;

            const api = `${apiUrl}${apiPath}/cart/${item.id}`;
            const cartObj = {
                data: {
                  product_id: item.product.id,
                  qty: item.qty
                }
            };

            axios.put(api, cartObj).then(res =>{
                if (item.qty < 1){
                    this.deleteShoppingCart(item.id);
                }else {
                    successToast(res.data.message);
                    this.getShoppingCart();
                    this.loadingStatus = '';
                };
            }).catch(err =>{
                errorToast(err.data.message);
            });
        },
        // 刪除購物車資料(單筆)
        deleteShoppingCart(id){
            this.loadingStatus = id;

            const api = `${apiUrl}${apiPath}/cart/${id}`;

            axios.delete(api).then(res =>{
                successToast(`${res.data.message} 購物車訂單：${id}`);
                this.getShoppingCart();
                this.loadingStatus = '';
            }).catch(err =>{
                errorToast(err.data.message);
            });
        },
        // 刪除購物車資料(全部)
        deleteShoppingCartAll() {
            this.isLoading = true;
            const api = `${apiUrl}${apiPath}/carts`;

            axios.delete(api).then(res =>{
                successToast("已清空購物車！！");
                this.getShoppingCart();
                setTimeout(() =>{
                    this.isLoading = false;
                }, 500);
            }).catch(err =>{
                errorToast(err.data.message);
            });
        },
        // 套用優惠券
        addCouponCode() {
            const api = `${apiUrl}${apiPath}/coupon`;
            const couponObj = {
                data: {
                    code: this.coupon_code
                }
            };
            axios.post(api, couponObj).then(res =>{
                successToast("已成功套用優惠券");
                this.getShoppingCart();
            }).catch(() =>{
                errorToast("優惠券無法使用或已過期");
            });
        },
        // 建立判斷手機號碼驗證
        isPhone(value) {
            const emptyNumber = /[^\s]/; // 定義 "符合任何非空白字符" 正規表達式
            if (!emptyNumber.test(value)){
                return "電話 為必填";
            }else {
                const phoneNumber = /^(09)[0-9]{8}$/; // 定義 "符合手機號碼格式" 正規表達式
                return phoneNumber.test(value) ? true : '請輸入正確的電話號碼格式';
            };
        },
        // 送出產品資料訂單
        formSubmit() {
            const api = `${apiUrl}${apiPath}/order`;
            const submitObj = this.form;
            axios.post(api, {data: submitObj}).then(res =>{
                this.$refs.form.resetForm();
                this.coupon_code = "";
                this.form = {
                    user: {
                        name: "",
                        email: "",
                        tel: "",
                        address: ""
                    },
                    message: ""
                }
                successToast(res.data.message);
                this.getShoppingCart();
            }).catch(() =>{
                errorToast("送出訂單失敗！！");
            });
        }
    },
    mounted() {
        this.getProducts();
        this.getShoppingCart();
    }
});

// 定義規則(全部加入)
Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
        VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    };
});

// 載入多國語系(TW)
VeeValidateI18n.loadLocaleFromURL('../i18n/zh_TW.json');
// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為輸入字元立即進行驗證
});

// 註冊全域元件
user_productsApp.component("productModal", productModal);
user_productsApp.component("loading", VueLoading);
user_productsApp.component('VForm', VeeValidate.Form);
user_productsApp.component('VField', VeeValidate.Field);
user_productsApp.component('ErrorMessage', VeeValidate.ErrorMessage)

user_productsApp.mount("#app");