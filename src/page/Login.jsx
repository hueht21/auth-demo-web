import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import { GoogleLogin } from '@react-oauth/google'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  CircularProgress,
} from '@mui/material'

import { useLocation } from 'react-router-dom'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')

  const [errors, setErrors] = useState({ username: '', password: '' })

  const location = useLocation()

  const [redirectUri, setRedirectUri] = useState('')

  const [checkingLogin, setCheckingLogin] = useState(true)

  // Hàm validate các trường nhập
  const validate = () => {
    const newErrors = { username: '', password: '' }
    let valid = true

    if (!username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập'
      valid = false
    }

    if (!password.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
      valid = false
    }

    setErrors(newErrors) // Cập nhật state lỗi
    return valid
  }

  // const { login } = useAuth()

  // Hàm xử lý đăng nhập qua Google
  const handleGoogleLoginSuccess = async (response) => {
    const { credential } = response

    console.log(credential)
    try {
      const googleResponse = await axios.post(
        'http://localhost:8080/api/auth/google',
        {
          token: credential, // Gửi token Google đến backend
        }
      )

      console.log('log', googleResponse)
      if (googleResponse.data.status) {
        // login(googleResponse.data.data.user, googleResponse.data.data.token) // Lưu thông tin người dùng vào AuthContext
        navigate('/dashboard') // Chuyển hướng tới trang dashboard
      } else {
        setErrorMessage(googleResponse.data.message || 'Đăng nhập thất bại')
      }
    } catch (err) {
      console.log('log', err)
      setErrorMessage('Đăng nhập Google thất bại')
    }
  }

  const handleGoogleLoginFailure = (error) => {
    setErrorMessage('Đăng nhập Google thất bại')
    console.log('Google login failed:', error)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect_uri')
    setRedirectUri(redirect)

    const token = localStorage.getItem('access_token')
    const userName = localStorage.getItem('userName')
    // Gọi checkLogin
    setCheckingLogin(true)

    if (token && userName !== null) {
      setTimeout(() => {
        axios
          .post(`http://localhost:8080/api/check`, {
            token: token,
          })
          .then((res) => {
            if (res.data.status) {
              const token = res.data.data

              window.location.href =
                redirect + '?userName=' + userName + '&access_token=' + token
            } else {
              setCheckingLogin(false)
            }
          })
      }, 1000)
    } else {
      setCheckingLogin(false)
    }
  }, [])

  const handleSubmit = async (e) => {
    // Validate input, nếu không hợp lệ thì không gọi API
    if (!validate()) return
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:8080/api/login', {
        username,
        password,
      })

      if (response.data.status) {
        const searchParams = new URLSearchParams(location.search)
        const redirectUri = searchParams.get('redirect_uri')

        localStorage.setItem('access_token', response.data.data.token)
        window.location.href =
          redirectUri +
          '?userName=' +
          username +
          '&access_token=' +
          response.data.data.token
      } else {
        setErrorMessage(response.data.message || 'Đăng nhập thất bại')
      }
    } catch (err) {
      console.error('Login error:', err)
      setErrorMessage(err.response.data || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  if (checkingLogin) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  } else {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#f5f5f5"
      >
        <Paper elevation={3} sx={{ p: 4, width: 350 }}>
          <Typography variant="h5" textAlign="center" mb={3}>
            Đăng nhập hệ thống
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Tên đăng nhập"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (errors.username) {
                  setErrors((prev) => ({ ...prev, username: '' }))
                }
              }}
              error={!!errors.username}
              helperText={errors.username}
            />
            <TextField
              label="Mật khẩu"
              variant="outlined"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: '' }))
                }
              }}
              error={!!errors.password}
              helperText={errors.password}
            />
            <Button
              variant="contained"
              disabled={loading} // Vô hiệu hóa button khi đang loading
              color="primary"
              onClick={handleSubmit}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Đăng nhập'
              )}
            </Button>
            {errorMessage && (
              <Typography color="error" fontSize={14} textAlign="center">
                {errorMessage}
              </Typography>
            )}
            {/* <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
            useOneTap // Kích hoạt tính năng đăng nhập một lần (One Tap)
          /> */}
          </Stack>
        </Paper>
      </Box>
    )
  }
}

export default Login
