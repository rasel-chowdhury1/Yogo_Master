import React from 'react';

const useAxiosFetch = () => {
    const axiosInstance = axios.create({
        baseURL: 'https://some-domain.com/api/',
        timeout: 1000,
        headers: {'X-Custom-Header': 'foobar'}
      });
    return (
        <div>
            
        </div>
    );
};

export default useAxiosFetch;