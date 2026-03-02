import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Item } from '../types/item';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Layout from '../components/Layout';

export default function Statistics() {
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

  const categoryData = items.reduce((acc: any[], item) => {
    const existing = acc.find(x => x.name === item.category);
    if (existing) {
      existing.count++;
      existing.value += item.price * item.quantity;
    } else {
      acc.push({
        name: item.category,
        count: 1,
        value: item.price * item.quantity
      });
    }
    return acc;
  }, []);

  const statusData = [
    {
      name: 'Actifs',
      value: items.filter(item => item.status === 'actif').length,
      total: items.filter(item => item.status === 'actif').reduce((sum, item) => sum + (item.price * item.quantity), 0)
    },
    {
      name: 'Inactifs',
      value: items.filter(item => item.status === 'inactif').length,
      total: items.filter(item => item.status === 'inactif').reduce((sum, item) => sum + (item.price * item.quantity), 0)
    },
  ];

  const priceRangeData = [
    { name: '0-50€', count: items.filter(item => item.price < 50).length },
    { name: '50-100€', count: items.filter(item => item.price >= 50 && item.price < 100).length },
    { name: '100-500€', count: items.filter(item => item.price >= 100 && item.price < 500).length },
    { name: '500€+', count: items.filter(item => item.price >= 500).length },
  ];

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

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
          <h2 className="text-3xl font-bold text-gray-900">Statistiques détaillées</h2>
          <p className="text-gray-600 mt-2">Analyse approfondie de vos données</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Valeur par catégorie</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)} €`} />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" name="Valeur totale (€)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par statut</h3>
            {items.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
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

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nombre d'éléments par catégorie</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10B981" name="Nombre d'éléments" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par gamme de prix</h3>
            {items.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceRangeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} name="Nombre d'éléments" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyse par statut</h3>
            <div className="space-y-4">
              {statusData.map((status, index) => (
                <div key={status.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="font-medium text-gray-900">{status.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{status.value} éléments</p>
                    <p className="text-sm text-gray-600">{status.total.toFixed(2)} € total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top catégories</h3>
            <div className="space-y-4">
              {categoryData
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
                .map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{category.value.toFixed(2)} €</p>
                      <p className="text-sm text-gray-600">{category.count} élément(s)</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
