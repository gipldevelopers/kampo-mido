// services/admin/customer.service.js

import API from "@/lib/api";

class CustomerService {
  // Get all customers
  async getAllCustomers() {
    try {
      const response = await API.get("/admin/customers/get-all-customers");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete customer
  async deleteCustomer(customerId) {
    try {
      const response = await API.delete(`/admin/customers/delete-customer/${customerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get customer by ID
  async getCustomerById(customerId) {
    try {
      const response = await API.get(`/admin/customers/view-customer/${customerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update customer
  async updateCustomer(customerId, customerData) {
    try {
      const response = await API.put(`/admin/customers/update-customer/${customerId}`, {
        fullName: customerData.fullName,
        gender: customerData.gender,
        dob: customerData.dob,
        mobile: customerData.mobile,
        whatsapp: customerData.whatsapp,
        email: customerData.email,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        pincode: customerData.pincode,
        kycStatus: customerData.kycStatus || "pending",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new CustomerService();

