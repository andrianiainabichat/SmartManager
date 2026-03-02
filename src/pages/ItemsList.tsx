import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Item } from '../types/item';
import { CreditCard as Edit, Trash2, Search, Filter } from 'lucide-react';
import Layout from '../components/Layout';

export default function ItemsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'actif' | 'inactif'>('all');
  const { user } = useAuth();

  useEffect(() => {
    loadItems();
  }, [user]);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, statusFilter]);

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

  const filterItems = () => {
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredItems(filtered);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (!error) {
      setItems(items.filter(item => item.id !== id));
    }
  };

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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Mes éléments</h2>
            <p className="text-gray-600 mt-2">Gérez vos éléments</p>
          </div>
          <Link
            to="/items/new"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Ajouter un élément
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, description ou catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="actif">Actifs</option>
                <option value="inactif">Inactifs</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Nom</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Description</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Catégorie</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Statut</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700">Prix</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700">Quantité</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="py-4 px-6 font-medium text-gray-900">{item.name}</td>
                      <td className="py-4 px-6 text-gray-600 max-w-xs truncate">{item.description}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          item.status === 'actif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-medium">{item.price.toFixed(2)} €</td>
                      <td className="py-4 px-6 text-right">{item.quantity}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/items/edit/${item.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm || statusFilter !== 'all'
                  ? 'Aucun élément ne correspond à vos critères de recherche'
                  : 'Aucun élément pour le moment. Commencez par en ajouter un !'}
              </p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <strong>{filteredItems.length}</strong> élément(s) affiché(s) sur <strong>{items.length}</strong> au total
          </p>
        </div>
      </div>
    </Layout>
  );
}
