import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { docsCols } from '../constants/variables.js';
import axios from '../axios.js';
import _this from '../constants/global.js';

export default function Docs() {

    const [appointments, setAppointments] = useState([]);
    
    const loadData = async () => {
        try {
            const { data } = await axios.get('/airtable?baseId=app2MprPYlwfIdCCd&tableId=tblPeLnoSRcNtno0o&viewId=viwuIm0sDHAJ3ywm8');
            const mappedData = data.rows.map(x => {
                return { ...x.fields, id: x.id };
            }).sort((a, b) => {
                return new Date(b.Start) - new Date(a.Start)
            });
            setAppointments(mappedData);
        } catch (error) {
            throw error;
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="w-full bg-white rounded-lg overflow-hidden">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Appointments</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {docsCols.map((col) => (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {appointments.map((appointment, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-left">
                                        <div className="text-sm font-medium">
                                            {appointment.Title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm flex items-center">
                                            {_this.formatDateTime(appointment.Start)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm flex items-center">
                                            {_this.formatDateTime(appointment.End)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm flex items-center">
                                            {appointment['Recurring Event'] ? 'Yes' : 'No'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${_this.getAppointmentStatusColor(appointment.Status)}`}>
                                            {appointment.Status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {_this.formatDate(appointment.Created)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

}