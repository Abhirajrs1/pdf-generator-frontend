import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument } from 'pdf-lib';
import axiosInstance from '../Services/Interceptors/userInterceptor.js';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaCheck, FaEye, FaFilePdf, FaTrashAlt } from 'react-icons/fa';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function Home() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedPages, setSelectedPages] = useState([]);
  const [numPages, setNumPages] = useState(0);
  const [pageScale, setPageScale] = useState(1.0);
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
            handleLogout();
          }
        } catch (error) {
          handleLogout();
        }
      }
    };
    checkAuthenticated();
  }, []);

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
        'aria-label': 'Upload your PDF'
      }
    });

    if (file) {
      const formData = new FormData();
      formData.append('pdf', file);
      try {
        const response = await axiosInstance.post('/upload-pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
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
    setSelectedPages([]);
  };

  const handlePageSelect = (pageNumber) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNumber)) {
        return prev.filter(page => page !== pageNumber);
      } else {
        return [...prev, pageNumber].sort((a, b) => a - b);
      }
    });
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
          position: 'top-center'
        });
        navigate('/user-login');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Logout failed!',
        icon: 'error',
        timer: 3000,
        position: 'top-center'
      });
    }
  };

  const handleRegeneratePdf = async () => {
    if (selectedPages.length === 0) {
      Swal.fire({
        title: 'Error!',
        text: 'Please select at least one page to download.',
        icon: 'error'
      });
      return;
    }
  
    try {
      Swal.fire({
        title: 'Generating PDF...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
  
      const pdfBytes = Uint8Array.from(atob(selectedPdf.base64), c => c.charCodeAt(0));
  
      const sourcePdfDoc = await PDFDocument.load(pdfBytes);
  
      const newPdfDoc = await PDFDocument.create();
  
      for (const pageNumber of selectedPages) {
        const [copiedPage] = await newPdfDoc.copyPages(sourcePdfDoc, [pageNumber - 1]);
        newPdfDoc.addPage(copiedPage);
      }
  
      const newPdfBytes = await newPdfDoc.save();
  
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = url;
  
      link.download = selectedPdf && selectedPdf.name 
        ? `${selectedPdf.name.replace('.pdf', '')}_selected_pages.pdf`
        : 'selected_pages.pdf'; 
      link.click();
  
      URL.revokeObjectURL(url);
      Swal.fire({
        title: 'Success!',
        text: 'PDF generated and downloaded successfully',
        icon: 'success',
        timer: 2000
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to generate PDF',
        icon: 'error'
      });
    }
  };
  
  
  

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
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
                <Document
                  file={`data:application/pdf;base64,${pdf.base64}`}
                  className="h-full"
                >
                  <Page 
                    pageNumber={1} 
                    width={200}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={() => handleViewPdf(pdf)}
                    className="opacity-0 hover:opacity-100 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                  >
                    <FaEye className="inline-block mr-2" /> View PDF
                  </button>
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
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm">Zoom:</label>
                      <select 
                        value={pageScale} 
                        onChange={(e) => setPageScale(parseFloat(e.target.value))}
                        className="border rounded p-1"
                      >
                        <option value={0.5}>50%</option>
                        <option value={0.75}>75%</option>
                        <option value={1.0}>100%</option>
                        <option value={1.25}>125%</option>
                        <option value={1.5}>150%</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setSelectedPdf(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1 bg-gray-50 p-4 rounded">
                    <h3 className="font-bold mb-2">Select Pages:</h3>
                    <div className="max-h-96 overflow-y-auto">
                      {Array.from({ length: numPages }, (_, index) => (
                        <label 
                          key={index}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPages.includes(index + 1)}
                            onChange={() => handlePageSelect(index + 1)}
                            className="form-checkbox h-4 w-4 text-blue-600"
                          />
                          <span>Page {index + 1}</span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-4 space-y-2">
                      <button
                        onClick={handleRegeneratePdf}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedPages.length === 0}
                      >
                        <FaFilePdf className="inline-block mr-2" />
                        Generate New PDF
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-3 overflow-y-auto max-h-[700px]">
                    <Document
                      file={`data:application/pdf;base64,${selectedPdf.base64}`}
                      onLoadSuccess={onDocumentLoadSuccess}
                      className="flex flex-col items-center"
                    >
                      {Array.from({ length: numPages }, (_, index) => (
                        <div 
                          key={index}
                          className={`mb-4 p-2 ${
                            selectedPages.includes(index + 1) 
                              ? 'ring-2 ring-blue-500 rounded'
                              : ''
                          }`}
                        >
                          <Page
                            pageNumber={index + 1}
                            scale={pageScale}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                        </div>
                      ))}
                    </Document>
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