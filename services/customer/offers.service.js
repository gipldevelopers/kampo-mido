import API from "../../lib/api";

class OfferService {
  /**
   * Get available promotional offers
   */
  async getAvailableOffers() {
    try {
      const response = await API.get("/customer/offers/list");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate a promo code
   */
  async validatePromoCode(code, type = 'deposit') {
    try {
      const response = await API.post("/customer/offers/validate", { code, type });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new OfferService();
