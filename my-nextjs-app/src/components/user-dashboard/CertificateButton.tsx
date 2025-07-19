import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../lib/auth';

interface CertificateButtonProps {
  courseId: string;
}

const CertificateButton: React.FC<CertificateButtonProps> = ({ courseId }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCertificate = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/download-certificate/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        window.location.href = response.data.data?.certificateId
          ? `http://localhost:8080/api/v1/download-certificate/${courseId}`
          : '#';
      } else {
        setError(response.data.message || 'Failed to generate certificate');
      }
    } catch (err) {
      setError('Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={handleGenerateCertificate}
        disabled={loading}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Award className="w-4 h-4" />
        <span>{loading ? 'Generating...' : 'Download Certificate'}</span>
      </motion.button>
      {error && (
        <p className="text-red-400 text-xs sm:text-sm mt-2 text-center">{error}</p>
      )}
    </>
  );
};

export default CertificateButton;