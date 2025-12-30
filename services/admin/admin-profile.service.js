// services/customer/profile.service.js

import API from "@/lib/api";

class CustomerProfileService {
  // Get customer profile
  async getProfile() {
    try {
      const response = await API.get("/admin/profile/get-profile");
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Update customer profile
  async updateProfile(profileData) {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', profileData.name);
      formData.append('mobile', profileData.mobile);
      formData.append('email', profileData.email);
      formData.append('address', profileData.address);
      if (profileData.city) formData.append('city', profileData.city);
      if (profileData.state) formData.append('state', profileData.state);
      if (profileData.pincode) formData.append('pincode', profileData.pincode);
      
      // Add profile picture if provided
      if (profileData.profilePicture) {
        formData.append('profilePicture', profileData.profilePicture);
      }

      const response = await API.put("/admin/profile/update-profile", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await API.put("/admin/profile/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      
      return response.data;
    } catch (error) {
      console.error('Change password error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new CustomerProfileService();