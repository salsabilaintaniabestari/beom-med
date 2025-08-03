import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { userProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!userProfile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Profil Saya</h1>
        <p className="text-gray-600 mt-2">Kelola informasi pribadi dan pengaturan akun</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">{userProfile.full_name}</h3>
            <p className="text-gray-600 capitalize">{userProfile.role}</p>
            <p className="text-sm text-gray-500 mt-2">{userProfile.email}</p>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-4 w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
            >
              {isEditing ? 'Batal Edit' : 'Edit Profil'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Informasi Detail</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-800">{userProfile.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userProfile.full_name}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-800">{userProfile.full_name}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bergabung Sejak</label>
                  <p className="text-gray-800">
                    {new Date(userProfile.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="text-gray-800 capitalize">{userProfile.role}</p>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Simpan Perubahan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {userProfile.role === 'pasien' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Kesehatan</h3>
          <div className="text-gray-500 text-center py-8">
            Riwayat kesehatan akan ditampilkan di sini
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;