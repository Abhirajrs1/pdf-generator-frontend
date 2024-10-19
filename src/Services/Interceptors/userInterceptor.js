import axios from 'axios'
import Swal from 'sweetalert2'

const axiosInstance=axios.create({
    baseURL:import.meta.env.VITE_BASE_URL,
    withCredentials:true
})

axiosInstance.interceptors.request.use(
    config=>{
        const token=localStorage.getItem('token')
        if(token){
            config.headers['Authorization']=`Bearer ${token}`
        }
        return config
    },
    error=>{
        return Promise.reject(error)
    }
)

axiosInstance.interceptors.response.use(
    response=>{
        return response
    },
    error=>{
        if(error.response && error.response.status===401){
            Swal.fire({
                title: 'Error!',
                text: 'Session expired. Please login again.',
                icon: 'error',
                timer: 5000,
                position: 'top-center',
              }).then(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/user-login'; 
              });
        }else{
            return Promise.reject(error)
        }
    }
)
export default axiosInstance