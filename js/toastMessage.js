// 建立 Toast 訊息物件
const Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

// 自訂成功訊息
export function successToast(msg){
    Toast.fire({
        icon: 'success',
        title: msg
    });
};
// 自訂錯誤訊息
export function errorToast(msg){
    Toast.fire({
        icon: 'error',
        title: msg
    });
};
// 自訂警告訊息
export function warningToast(msg){
    Toast.fire({
        icon: 'warning',
        title: msg
    });
};