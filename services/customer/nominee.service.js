// services/customer/nominee.service.js

import API from "@/lib/api";

class NomineeService {
  // Create/Update nominee
  async createNominee(nomineeData) {
    try {
      const response = await API.post("/customer/nominee", {
        name: nomineeData.name,
        relationship: nomineeData.relationship,
        dob: nomineeData.dob,
        address: nomineeData.address,
        phone: nomineeData.phone,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new NomineeService();

