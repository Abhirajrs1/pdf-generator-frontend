import * as Yup from 'yup'

export const validationSignup=Yup.object().shape({
    name: Yup.string()
    .matches(/^[a-zA-Z.]+$/, 'Username can only contain letters and periods, without spaces.') 
    .min(3, 'Must be at least 3 characters long.')
    .required("Name is required"),
    email: Yup.string()
    .email('Email must be a valid email address.')
    .matches(/^[^\s@]+@gmail\.com$/, 'Email must be a valid gmail.com address.')
    .required("Email is required"),
    password: Yup.string()
    .min(8, 'Password must be at least 8 characters long.')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .matches(/\d/, 'Password must contain at least one number.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character.')
    .required('Password is required'),
    confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
})
export const validateLoginForm = Yup.object().shape({
    email: Yup.string()
      .test(
        'is-gmail',
        'Only gmail.com addresses are allowed.',
        value => !value || /^[^\s@]+@gmail\.com$/.test(value)
      )
      .required('Email is required.'),
    password: Yup.string()
      .required('Password is required.'),
  });