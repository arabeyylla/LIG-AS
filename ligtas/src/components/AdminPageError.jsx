import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class AdminPageError extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-red-100 rounded-3xl p-8 text-center shadow-sm">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={40} />
          <h1 className="text-xl font-black text-slate-800">Assessment page could not load</h1>
          <p className="text-sm text-slate-500 mt-3">{this.state.error.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold">Reload page</button>
        </div>
      </div>
    );
  }
}
