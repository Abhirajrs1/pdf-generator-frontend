import React, { useEffect, useState } from 'react';
import axiosInstance from '../Services/Interceptors/userInterceptor.js';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaCheck, FaEye, FaFilePdf,FaTrashAlt } from 'react-icons/fa';

function Home() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedPages, setSelectedPages] = useState([]);
  const [numPages, setNumPages] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthenticated = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axiosInstance.get('/verify');
          if (response.data.success) {
            setUser(response.data.user);
            fetchPdf();
          } else {
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/user-login');
          }
        } catch (error) {
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/user-login');
        }
      }
    };
    checkAuthenticated();
  }, [navigate]);

  const fetchPdf = async () => {
    try {
      const response = await axiosInstance.get('/fetchPdf');
      if (response.data.success) {
        setPdfs(response.data.pdfs);
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    }
  };

  const handleAddPdf = async () => {
    const { value: file } = await Swal.fire({
      title: 'Select PDF',
      input: 'file',
      inputAttributes: {
        accept: 'application/pdf',
        'aria-label': 'Upload your PDF',
      },
    });
    if (file) {
      const formData = new FormData();
      formData.append('pdf', file);
      try {
        const response = await axiosInstance.post('/upload-pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data.success) {
          Swal.fire('Uploaded!', 'Your PDF has been uploaded.', 'success');
          fetchPdf();
        }
      } catch (error) {
        Swal.fire('Error!', 'PDF upload failed.', 'error');
      }
    }
  };

  const handleViewPdf = (pdf) => {
    setSelectedPdf(pdf);
    setNumPages(pdf.pages);
    setSelectedPages([]);
    setPreviewMode(false);
  };


  const handlePageSelect = (pageNumber) => {
    setSelectedPages(prev => {
      const newSelection = prev.includes(pageNumber)
        ? prev.filter(page => page !== pageNumber)
        : [...prev, pageNumber].sort((a, b) => a - b);
      return newSelection;
    });
  };

  const handlePreviewSelected = () => {
    if (selectedPages.length === 0) {
      Swal.fire('Warning', 'Please select at least one page to preview', 'warning');
      return;
    }
    setPreviewMode(true);
  };

  const handleDeletePdf = async (pdfId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.delete(`/delete-pdf/${pdfId}`);
        if (response.data.success) {
          Swal.fire('Deleted!', 'Your PDF has been deleted.', 'success');
          fetchPdf(); 
        }
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete PDF.', 'error');
      }
    }
  };


  const handleRegeneratePdf = async () => {
    if (!selectedPdf || selectedPages.length === 0) {
      Swal.fire('Error!', 'Please select at least one page to regenerate', 'error');
      return;
    }

    try {
      Swal.fire({
        title: 'Generating PDF...',
        text: 'Please wait while we process your request',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      const response = await axiosInstance.post('/regenerate-pdf', {
        pdf: selectedPdf._id,
        selectedPages: selectedPages
      });
      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'PDF has been regenerated with selected pages',
          icon: 'success',
          showConfirmButton: true,
          confirmButtonText: 'Download PDF',
          showCancelButton: true,
          cancelButtonText: 'Close'
        }).then((result) => {
          if (result.isConfirmed && response.data.pdfUrl) {
            window.open(response.data.pdfUrl, '_blank');
          }
        });
        fetchPdf();
      }
    } catch (error) {
      Swal.fire('Error!', 'Failed to regenerate PDF.', 'error');
    }
  };

  const handleClosePdf = () => {
    setSelectedPdf(null);
  };

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.get('/logout');
      if (response.data.success) {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Swal.fire({
          title: 'Success!',
          text: response.data.message,
          icon: 'success',
          timer: 5000,
          position: 'top-center',
        });
        navigate('/user-login');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Logout failed!',
        icon: 'error',
        timer: 3000,
        position: 'top-center',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <span className="font-bold text-xl">PDF Generator</span>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="font-semibold">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto my-8 px-4">
        <button
          onClick={handleAddPdf}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 mb-4"
        >
          Add PDF
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pdfs.map((pdf, index) => (
            <div key={index} className="bg-white p-4 rounded shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold truncate">{pdf.name}</h3>
                <span className="text-sm text-gray-500">{pdf.pages} pages</span>
              </div>
              <div className="relative h-40 bg-gray-100 rounded mb-2">
                <iframe
                  src={`data:application/pdf;base64,${pdf.base64}`}
                  title={pdf.name}
                  width="100%"
                  height="150px"
                  className="border-2 border-gray-300 rounded"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={() => handleViewPdf(pdf)}
                    className="opacity-0 hover:opacity-100 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                  >
                    <FaEye className="inline-block mr-2" /> View PDF
                  </button>
                  {/* <button
                onClick={() => handleDeletePdf(pdf._id)}
                className="absolute top-0 right-0 mb-3 ml-2 bg-red-500 hover:bg-red-600 text-white font-bold p-2 rounded-full transition duration-300"
              >
                <FaTrashAlt />
              </button> */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedPdf && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Selected PDF: {selectedPdf.name}</h2>
                  <button
                    onClick={() => setSelectedPdf(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1 bg-gray-50 p-4 rounded">
                    <h3 className="font-bold mb-2">Select Pages:</h3>
                    <div className="flex flex-wrap">
                      {Array.from({ length: numPages }, (_, index) => (
                        <div
                          key={index}
                          onClick={() => handlePageSelect(index + 1)}
                          className={`cursor-pointer p-2 border m-1 rounded transition duration-300 ${selectedPages.includes(index + 1)
                              ? 'bg-blue-500 text-white border-blue-700 shadow-lg' 
                              : 'bg-gray-200 hover:bg-gray-300 border-gray-400' 
                            }`}
                        >
                          Page {index + 1}
                        </div>
                      ))}
                    </div>


                    <div className="mt-4 space-y-2">
                      <button
                        onClick={handlePreviewSelected}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                        disabled={selectedPages.length === 0}
                      >
                        Preview Selected
                      </button>
                      <button
                        onClick={handleRegeneratePdf}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                        disabled={selectedPages.length === 0}
                      >
                        <FaFilePdf className="inline-block mr-2" />
                        Generate New PDF
                      </button>

                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <iframe
                      src={`data:application/pdf;base64,${selectedPdf.base64}${previewMode && selectedPages.length > 0
                          ? '#page=' + selectedPages.join(',')
                          : ''
                        }`}
                      title={selectedPdf.name}
                      className="w-full h-[600px] border-2 border-gray-200 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
