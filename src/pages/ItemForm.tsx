import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ItemFormData } from '../types/item';
import { Save, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    description: '',
    category: 'Général',
    status: 'actif',
    price: 0,
    quantity: 0,
  });

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  const loadItem = async () => {
    if (!id || !user) return;

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      setError('Erreur lors du chargement de l\'élément');
      return;
    }

    if (data) {
      setFormData({
        name: data.name,
        description: data.description,
        category: data.category,
        status: data.status,
        price: data.price,
        quantity: data.quantity,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) return;

    if (id) {
      const { error } = await supabase
        .from('items')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        setError('Erreur lors de la modification de l\'élément');
        setLoading(false);
      } else {
        navigate('/items');
      }
    } else {
      const { error } = await supabase
        .from('items')
        .insert([{ ...formData, user_id: user.id }]);

      if (error) {
        setError('Erreur lors de la création de l\'élément');
        setLoading(false);
      } else {
        navigate('/items');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <button
            onClick={() => navigate('/items')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour à la liste
          </button>
          <h2 className="text-3xl font-bold text-gray-900">
            {id ? 'Modifier l\'élément' : 'Ajouter un élément'}
          </h2>
          <p className="text-gray-600 mt-2">
            {id ? 'Modifiez les informations de l\'élément' : 'Créez un nouvel élément'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'élément *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Ordinateur portable"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Description détaillée de l'élément..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Général">Général</option>
                <option value="Électronique">Électronique</option>
                <option value="Mobilier">Mobilier</option>
                <option value="Fournitures">Fournitures</option>
                <option value="Équipement">Équipement</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Statut *
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Prix (€) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantité *
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Enregistrement...' : id ? 'Enregistrer les modifications' : 'Créer l\'élément'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/items')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
