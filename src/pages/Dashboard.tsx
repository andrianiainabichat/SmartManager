import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Item } from '../types/item';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, TrendingUp, DollarSign, Activity } from 'lucide-react';
import Layout from '../components/Layout';

export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadItems();
  }, [user]);

  const loadItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  const stats = {
    total: items.length,
    actifs: items.filter(item => item.status === 'actif').length,
    inactifs: items.filter(item => item.status === 'inactif').length,
    valeurTotale: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
  };

  const categoryData = items.reduce((acc: any[], item) => {
    const existing = acc.find(x => x.name === item.category);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.category, value: 1 });
    }
    return acc;
  }, []);

  const statusData = [
    { name: 'Actifs', value: stats.actifs },
    { name: 'Inactifs', value: stats.inactifs },
  ];

  const COLORS = ['#3B82F6', '#EF4444'];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tableau de bord</h2>
          <p className="text-gray-600 mt-2">Vue d'ensemble de votre gestion</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total éléments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Éléments actifs</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.actifs}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Éléments inactifs</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactifs}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valeur totale</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.valeurTotale.toFixed(2)} €</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par catégorie</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" name="Nombre d'éléments" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut des éléments</h3>
            {stats.total > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Derniers éléments ajoutés</h3>
          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nom</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Catégorie</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {items.slice(0, 5).map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.category}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'actif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">{item.price.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Aucun élément ajouté pour le moment</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
