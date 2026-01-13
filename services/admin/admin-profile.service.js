// services/admin/admin-profile.service.js

import API from "@/lib/api";

class AdminProfileService {
  // Get admin profile
  async getProfile() {
    try {
      const response = await API.get("/admin/profile/get-profile");
      return response.data;
    } catch (error) {
      console.error('Get admin profile error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Update admin profile
  async updateProfile(profileData) {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add text fields
      if (profileData.name) formData.append('name', profileData.name);
      if (profileData.firstname) formData.append('firstname', profileData.firstname);
      if (profileData.lastname) formData.append('lastname', profileData.lastname);
      if (profileData.email) formData.append('email', profileData.email);
      if (profileData.phone) formData.append('phone', profileData.phone);
      if (profileData.address) formData.append('address', profileData.address);
      
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
      console.error('Update admin profile error:', error.response?.data || error.message);
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
      console.error('Change admin password error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new AdminProfileService();