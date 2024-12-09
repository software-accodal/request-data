
/**
 * @description global reusable functions
 */
export default {

    /**
     * 
     * @description format date and time
     * @param {*} dateTimeStr 
     * @returns (eg.) January 01, 2024, 01:00 PM
     */
    formatDateTime(dateTimeStr) {
        const date = new Date(dateTimeStr);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        return `${formattedDate}, ${formattedTime}`;
    },
    
        /**
     * 
     * @description format date and time
     * @param {*} dateTimeStr 
     * @returns (eg.) January 01, 2024, 01:00 PM
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    },
    
    getAppointmentStatusColor(status) {
        switch(status.toLowerCase()) {
          case 'scheduled':
            return 'bg-green-100 text-green-800';
          case 'pending':
            return 'bg-yellow-100 text-yellow-800';
          case 'confirmed':
            return 'bg-blue-100 text-blue-800';
          default:
            return 'bg-gray-100 text-gray-800';
        }
    }

}