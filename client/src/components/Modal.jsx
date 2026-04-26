import { HiExclamationTriangle, HiCheckCircle, HiInformationCircle, HiXMark } from 'react-icons/hi2';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', 
  confirmText = 'OK', 
  cancelText, 
  onConfirm, 
  isLoading = false,
  children 
}) {
  if (!isOpen) return null;

  const icons = {
    warning: <HiExclamationTriangle className="h-6 w-6 text-yellow-500" />,
    success: <HiCheckCircle className="h-6 w-6 text-green-500" />,
    error: <HiXMark className="h-6 w-6 text-red-500" />,
    info: <HiInformationCircle className="h-6 w-6 text-blue-500" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 opacity-100">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-2 rounded-full ${
              type === 'warning' ? 'bg-yellow-50' : 
              type === 'success' ? 'bg-green-50' : 
              type === 'error' ? 'bg-red-50' : 'bg-blue-50'
            }`}>
              {icons[type]}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          
          <div className="text-gray-600 mb-6 leading-relaxed">
            {message}
            {children}
          </div>

          <div className="flex flex-col sm:flex-row-reverse gap-3">
            <button
              onClick={onConfirm || onClose}
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-xl font-bold text-white transition duration-200 shadow-md flex items-center justify-center min-w-[100px] ${
                type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                'bg-indigo-600 hover:bg-indigo-700'
              } disabled:opacity-50`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : confirmText}
            </button>
            
            {cancelText && (
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition duration-200"
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
