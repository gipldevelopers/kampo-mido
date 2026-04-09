import API from "@/lib/api";

class OfferService {
  /**
   * Create a new offer
   */
  async createOffer(offerData) {
    try {
      const response = await API.post("/admin/offers/create", offerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all offers
   */
  async getAllOffers() {
    try {
      const response = await API.get("/admin/offers/list");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get specific offer by ID
   */
  async getOfferById(offerId) {
    try {
      const response = await API.get(`/admin/offers/view/${offerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing offer
   */
  async updateOffer(offerId, offerData) {
    try {
      const response = await API.put(`/admin/offers/update/${offerId}`, offerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle offer status
   */
  async toggleStatus(offerId, status) {
    try {
      const response = await API.patch(`/admin/offers/toggle-status/${offerId}`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Broadcast offer to all customers
   */
  async broadcastToAll(offerId) {
    try {
      const response = await API.post(`/admin/offers/broadcast/${offerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send offer to selected customers
   */
  async sendToSelected(offerId, customerIds) {
    try {
      const response = await API.post("/admin/offers/send-selected", { offerId, customerIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get list of customers (for selection)
   * This might reuse user service, but we need it for selecting targets
   */
  async getCustomersForSelection() {
    try {
      const response = await API.get("/admin/customers/get-all-customers?kycStatus=approved");
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new OfferService();
